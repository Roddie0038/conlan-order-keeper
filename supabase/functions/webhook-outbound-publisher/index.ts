import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OutboxEvent {
  id: string;
  event_type: string;
  event_id: string;
  trace_id?: string;
  payload: Record<string, any>;
  created_at: string;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
  error_message?: string;
}

interface WebhookConfig {
  id: string;
  webhook_url: string;
  webhook_secret: string;
  platform_name: string;
  rate_limit_per_minute: number;
  timeout_seconds: number;
  retry_enabled: boolean;
  max_retries: number;
  hmac_enabled: boolean;
  hmac_algorithm: string;
}

async function generateHmacSignature(
  payload: string,
  secret: string,
  timestamp: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const dataToSign = `${timestamp}.${payload}`;
  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(dataToSign)
  );

  return Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function calculateBackoff(retryCount: number): number {
  // Exponential backoff with full jitter
  const baseDelay = 1000; // 1 second
  const maxDelay = 300000; // 5 minutes
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
  return Math.floor(Math.random() * exponentialDelay);
}

async function publishWebhookEvent(
  event: OutboxEvent,
  config: WebhookConfig,
  supabase: any
): Promise<{ success: boolean; statusCode?: number; error?: string; duration?: number }> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const deliveryId = event.event_id;
  const traceId = event.trace_id || crypto.randomUUID();

  console.log(`[Webhook Publisher] Publishing ${event.event_type} to ${config.platform_name}`);

  try {
    // Prepare webhook payload
    const webhookPayload = {
      event_id: event.event_id,
      event_type: event.event_type,
      source: 'ordering',
      timestamp: timestamp,
      trace_id: traceId,
      payload: event.payload
    };

    const payloadString = JSON.stringify(webhookPayload);

    // Generate HMAC signature if enabled
    let signature = '';
    if (config.hmac_enabled) {
      signature = await generateHmacSignature(payloadString, config.webhook_secret, timestamp);
    }

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-cto-timestamp': timestamp,
      'x-cto-delivery-id': deliveryId,
      'x-cto-trace-id': traceId,
      'x-cto-event-type': event.event_type,
      'x-cto-source': 'ordering'
    };

    if (config.hmac_enabled && signature) {
      headers['x-cto-signature'] = signature;
    }

    // Send webhook request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout_seconds * 1000);

    const response = await fetch(config.webhook_url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    const responseBody = await response.text();
    const success = response.ok;

    console.log(`[Webhook Publisher] Response: ${response.status} in ${duration}ms`);

    // Log delivery attempt to app_webhook_deliveries
    await supabase
      .from('app_webhook_deliveries' as any)
      .insert({
        webhook_id: config.id,
        event_type: event.event_type,
        idempotency_key: deliveryId,
        request_url: config.webhook_url,
        request_method: 'POST',
        request_headers: headers,
        request_body: webhookPayload,
        request_timestamp: timestamp,
        response_status: response.status,
        response_headers: Object.fromEntries(response.headers.entries()),
        response_body: responseBody.substring(0, 10000), // Limit size
        duration_ms: duration,
        success: success,
        error_message: success ? null : `HTTP ${response.status}: ${responseBody}`,
        hmac_signature: signature || null,
        retry_count: event.retry_count
      });

    return {
      success,
      statusCode: response.status,
      duration,
      error: success ? undefined : `HTTP ${response.status}`
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || String(error);

    console.error(`[Webhook Publisher] Error:`, errorMessage);

    // Log failed delivery attempt
    await supabase
      .from('app_webhook_deliveries' as any)
      .insert({
        webhook_id: config.id,
        event_type: event.event_type,
        idempotency_key: deliveryId,
        request_url: config.webhook_url,
        request_method: 'POST',
        request_headers: { 'Content-Type': 'application/json' },
        request_body: { event_type: event.event_type, payload: event.payload },
        request_timestamp: timestamp,
        response_status: null,
        duration_ms: duration,
        success: false,
        error_message: errorMessage,
        retry_count: event.retry_count
      });

    return {
      success: false,
      error: errorMessage,
      duration
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('[Webhook Publisher] Starting outbox processing...');

    // Query pending events from webhook_outbox
    const { data: pendingEvents, error: outboxError } = await supabase
      .from('webhook_outbox' as any)
      .select('*')
      .in('status', ['pending', 'failed'])
      .or(`next_retry_at.is.null,next_retry_at.lte.${new Date().toISOString()}`)
      .order('created_at', { ascending: true })
      .limit(50);

    if (outboxError) {
      console.error('[Webhook Publisher] Error fetching outbox:', outboxError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch outbox events', details: outboxError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pendingEvents || pendingEvents.length === 0) {
      console.log('[Webhook Publisher] No pending events to process');
      return new Response(
        JSON.stringify({ message: 'No pending events', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Webhook Publisher] Found ${pendingEvents.length} pending events`);

    const results = {
      processed: 0,
      delivered: 0,
      failed: 0,
      retrying: 0
    };

    // Process each event
    for (const event of pendingEvents) {
      // Skip events that have exceeded max retries
      if (event.retry_count >= event.max_retries) {
        console.log(`[Webhook Publisher] Skipping event ${event.event_id} - max retries exceeded`);
        continue;
      }

      // Mark as processing
      await supabase
        .from('webhook_outbox' as any)
        .update({ status: 'processing' })
        .eq('id', event.id);

      // Get webhook configurations for this event type
      const { data: webhookLinks, error: linksError } = await supabase
        .from('app_platform_links' as any)
        .select(`
          id,
          webhook_url,
          webhook_secret,
          platform_id,
          timeout_seconds,
          retry_enabled,
          max_retries,
          hmac_enabled,
          hmac_algorithm,
          rate_limit_per_minute,
          is_active
        `)
        .eq('webhook_type', event.event_type)
        .eq('is_active', true);

      if (linksError || !webhookLinks || webhookLinks.length === 0) {
        console.log(`[Webhook Publisher] No active webhooks configured for ${event.event_type}`);
        
        // Mark as failed - no webhook configured
        await supabase
          .from('webhook_outbox' as any)
          .update({
            status: 'failed',
            error_message: 'No active webhook configured for this event type'
          })
          .eq('id', event.id);
        
        results.failed++;
        continue;
      }

      // Get platform details
      const { data: platforms } = await supabase
        .from('app_platforms' as any)
        .select('id, platform_name')
        .in('id', webhookLinks.map((link: any) => link.platform_id));

      const platformMap = new Map(platforms?.map((p: any) => [p.id, p.platform_name]) || []);

      // Publish to all configured webhooks
      let allSucceeded = true;
      let lastError = '';

      for (const link of webhookLinks) {
        const config: WebhookConfig = {
          id: link.id,
          webhook_url: link.webhook_url,
          webhook_secret: link.webhook_secret || '',
          platform_name: platformMap.get(link.platform_id) || 'Unknown',
          rate_limit_per_minute: link.rate_limit_per_minute || 60,
          timeout_seconds: link.timeout_seconds || 30,
          retry_enabled: link.retry_enabled ?? true,
          max_retries: link.max_retries || 3,
          hmac_enabled: link.hmac_enabled ?? false,
          hmac_algorithm: link.hmac_algorithm || 'sha256'
        };

        const result = await publishWebhookEvent(event, config, supabase);

        if (!result.success) {
          allSucceeded = false;
          lastError = result.error || 'Unknown error';
        }
      }

      // Update outbox status
      if (allSucceeded) {
        await supabase
          .from('webhook_outbox' as any)
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', event.id);
        
        results.delivered++;
      } else {
        const newRetryCount = event.retry_count + 1;
        const shouldRetry = newRetryCount < event.max_retries;

        if (shouldRetry) {
          const backoffMs = calculateBackoff(newRetryCount);
          const nextRetryAt = new Date(Date.now() + backoffMs).toISOString();

          await supabase
            .from('webhook_outbox' as any)
            .update({
              status: 'failed',
              retry_count: newRetryCount,
              next_retry_at: nextRetryAt,
              error_message: lastError
            })
            .eq('id', event.id);
          
          results.retrying++;
        } else {
          await supabase
            .from('webhook_outbox' as any)
            .update({
              status: 'failed',
              retry_count: newRetryCount,
              error_message: `Max retries exceeded: ${lastError}`
            })
            .eq('id', event.id);
          
          results.failed++;
        }
      }

      results.processed++;
    }

    console.log('[Webhook Publisher] Processing complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Outbox processing complete',
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Webhook Publisher] Fatal error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
