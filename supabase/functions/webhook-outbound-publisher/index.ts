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

// Not used anymore - backoff logic moved inline for clarity
// function calculateBackoff(retryCount: number): number {
//   const baseDelay = 1000; // 1 second
//   const maxDelay = 300000; // 5 minutes
//   const exponentialDelay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
//   return Math.floor(Math.random() * exponentialDelay);
// }

async function publishWebhookEvent(
  event: OutboxEvent,
  config: WebhookConfig,
  supabase: any
): Promise<{ success: boolean; statusCode?: number; error?: string; duration?: number }> {
  const startTime = Date.now();
  const timestampMs = Date.now().toString(); // Epoch milliseconds as string
  const deliveryId = event.event_id;
  const traceId = event.trace_id || crypto.randomUUID();

  console.log(`[Webhook Publisher] Publishing ${event.event_type} to ${config.platform_name}`);

  try {
    // Prepare webhook payload - exact envelope format
    const webhookPayload = {
      event_id: event.event_id,
      event_type: event.event_type,
      source: 'ordering',
      timestamp: timestampMs,
      trace_id: traceId,
      payload: event.payload
    };

    const payloadString = JSON.stringify(webhookPayload);

    // Generate HMAC signature if enabled - SHA-256 over raw JSON body, hex lowercase
    let signature = '';
    if (config.hmac_enabled && config.webhook_secret) {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(config.webhook_secret);
      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signatureBytes = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(payloadString)
      );
      
      signature = Array.from(new Uint8Array(signatureBytes))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // 3️⃣ Log signature details for verification (not full secret)
      console.log(
        `[Publisher] HMAC signature generated - length=${signature.length} prefix=${signature.substring(0, 8)}`
      );
    } else {
      console.log(`[Publisher] HMAC disabled or no secret - hmac_enabled=${config.hmac_enabled} has_secret=${!!config.webhook_secret}`);
    }

    // Build headers - generic format: X-Signature, X-Timestamp (ms), X-Event-Id
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Timestamp': timestampMs,
      'X-Event-Id': deliveryId
    };

    if (config.hmac_enabled && signature) {
      headers['X-Signature'] = signature;
    }
    
    // Optional trace ID header
    if (traceId) {
      headers['X-Trace-Id'] = traceId;
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

    // D. Log per-dispatch status (one line per attempt)
    console.log(
      `[Publisher] dispatch type=${event.event_type} outbox_id=${event.id} url=${config.webhook_url} status=${response.status} signed=${config.hmac_enabled}`
    );

    // 4. Log delivery attempt to webhook_deliveries
    await supabase
      .from('webhook_deliveries' as any)
      .insert({
        outbox_id: event.id,
        attempt_no: event.retry_count + 1,
        target_url: config.webhook_url,
        http_status: response.status,
        status: success ? 'delivered' : 'failed',
        error: success ? null : responseBody.substring(0, 1000)
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

    console.error(`[Publisher] dispatch type=${event.event_type} outbox_id=${event.id} url=${config.webhook_url} status=error signed=${config.hmac_enabled}`);

    // Log failed delivery attempt
    await supabase
      .from('webhook_deliveries' as any)
      .insert({
        outbox_id: event.id,
        attempt_no: event.retry_count + 1,
        target_url: config.webhook_url,
        http_status: null,
        status: 'failed',
        error: errorMessage.substring(0, 1000)
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

  // A. Enforce JWT authentication
  // Note: Supabase automatically validates JWT when verify_jwt=true (default)
  // By the time we reach this code, the JWT has been validated by Supabase infrastructure
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('[Webhook Publisher] Unauthorized request - missing Authorization header');
    return new Response(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // C. Check for force mode
    const url = new URL(req.url);
    const forceMode = url.searchParams.get('mode') === 'force';
    
    console.log(`[Webhook Publisher] Starting outbox processing... (force=${forceMode})`);

    // Query pending and retrying events from webhook_outbox
    // A. Load pending events
    const { data: pendingEvents, error: pendingError } = await supabase
      .from('webhook_outbox' as any)
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (pendingError) {
      console.error('[Webhook Publisher] Error fetching pending events:', pendingError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch pending events', details: pendingError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // A. Load retrying events (with or without force mode)
    let retryingQuery = supabase
      .from('webhook_outbox' as any)
      .select('*')
      .eq('status', 'retrying')
      .order('next_retry_at', { ascending: true })
      .limit(50);

    // Only apply time filter if not in force mode
    if (!forceMode) {
      retryingQuery = retryingQuery.lte('next_retry_at', new Date().toISOString());
    }

    const { data: retryingEvents, error: retryingError } = await retryingQuery;

    if (retryingError) {
      console.error('[Webhook Publisher] Error fetching retrying events:', retryingError);
    }

    // Combine pending and retrying events
    const allEvents = [...(pendingEvents || []), ...(retryingEvents || [])];

    if (!allEvents || allEvents.length === 0) {
      console.log('[Webhook Publisher] No events to process');
      return new Response(
        JSON.stringify({ message: 'No pending or retrying events', processed: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Webhook Publisher] Found ${allEvents.length} events to process (${pendingEvents?.length || 0} pending, ${retryingEvents?.length || 0} retrying)`);

    const results = {
      processed: 0,
      delivered: 0,
      failed: 0,
      retrying: 0
    };

    // Process each event
    for (const event of allEvents) {
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

      // 1. Get webhook configurations for this event type from app_platform_links
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

      // 5. No-link handling - if no active webhook configured, mark as failed
      if (linksError || !webhookLinks || webhookLinks.length === 0) {
        console.log(`[Webhook Publisher] No active webhooks configured for ${event.event_type}`);
        
        // Log failed delivery to webhook_deliveries
        await supabase
          .from('webhook_deliveries' as any)
          .insert({
            outbox_id: event.id,
            attempt_no: event.retry_count + 1,
            target_url: null,
            http_status: null,
            status: 'failed',
            error: 'No active webhook configured for this event type'
          });

        // Mark as failed - no webhook configured (do not retry)
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

      // B. Update outbox status with proper transitions
      if (allSucceeded) {
        await supabase
          .from('webhook_outbox' as any)
          .update({
            status: 'delivered',
            delivered_at: new Date().toISOString()
          })
          .eq('id', event.id);
        
        results.delivered++;
      } else {
        const newRetryCount = event.retry_count + 1;
        const shouldRetry = newRetryCount < event.max_retries;

        if (shouldRetry) {
          // Use exponential backoff: 15s * 2^retry_count, max 5 minutes
          const baseDelay = 15000; // 15 seconds
          const maxDelay = 300000; // 5 minutes
          const backoffMs = Math.min(baseDelay * Math.pow(2, newRetryCount), maxDelay);
          const nextRetryAt = new Date(Date.now() + backoffMs).toISOString();

          await supabase
            .from('webhook_outbox' as any)
            .update({
              status: 'retrying',
              retry_count: newRetryCount,
              next_retry_at: nextRetryAt,
              error_message: lastError
            })
            .eq('id', event.id);
          
          console.log(`[Webhook Publisher] Event ${event.event_id} scheduled for retry ${newRetryCount}/${event.max_retries} at ${nextRetryAt}`);
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
          
          console.log(`[Webhook Publisher] Event ${event.event_id} permanently failed after ${newRetryCount} attempts`);
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
