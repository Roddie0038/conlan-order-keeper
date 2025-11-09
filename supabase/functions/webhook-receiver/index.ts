import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cto-signature, x-cto-timestamp, x-cto-delivery-id, x-cto-trace-id',
};

interface WebhookEvent {
  event_id: string;
  event_type: string;
  source: string;
  timestamp: string;
  trace_id?: string;
  payload: Record<string, any>;
}

async function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): Promise<boolean> {
  try {
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

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return signature === expectedSignature;
  } catch (error) {
    console.error('[HMAC Verification] Error:', error);
    return false;
  }
}

function validateTimestamp(timestamp: string, toleranceMinutes: number = 5): boolean {
  try {
    const requestTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diff = Math.abs(now - requestTime);
    const maxDiff = toleranceMinutes * 60 * 1000;
    
    return diff <= maxDiff;
  } catch (error) {
    console.error('[Timestamp Validation] Error:', error);
    return false;
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
    // Extract platform_key from URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const platformKey = pathParts[pathParts.length - 1];

    console.log(`[Webhook Receiver] Incoming request for platform: ${platformKey}`);

    if (!platformKey) {
      return new Response(
        JSON.stringify({ error: 'Platform key is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get headers
    const signature = req.headers.get('x-cto-signature');
    const timestamp = req.headers.get('x-cto-timestamp');
    const deliveryId = req.headers.get('x-cto-delivery-id');
    const traceId = req.headers.get('x-cto-trace-id');

    if (!signature || !timestamp || !deliveryId) {
      console.error('[Webhook Receiver] Missing required headers');
      return new Response(
        JSON.stringify({ error: 'Missing required headers: x-cto-signature, x-cto-timestamp, x-cto-delivery-id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check idempotency - has this delivery_id been processed before?
    const { data: existingDelivery } = await supabase
      .from('event_receipts' as any)
      .select('event_id, status')
      .eq('event_id', deliveryId)
      .maybeSingle();

    if (existingDelivery) {
      console.log(`[Webhook Receiver] Duplicate delivery detected: ${deliveryId}`);
      return new Response(
        JSON.stringify({ 
          message: 'Event already processed', 
          event_id: deliveryId,
          status: existingDelivery.status 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate timestamp (5-minute tolerance)
    if (!validateTimestamp(timestamp)) {
      console.error('[Webhook Receiver] Timestamp validation failed');
      return new Response(
        JSON.stringify({ error: 'Request timestamp is outside acceptable window' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get platform webhook secret
    const { data: platform, error: platformError } = await supabase
      .from('app_platforms' as any)
      .select('id, platform_name, webhook_secret, previous_secret, is_active')
      .eq('platform_key', platformKey)
      .eq('is_active', true)
      .maybeSingle();

    if (platformError || !platform) {
      console.error('[Webhook Receiver] Platform not found or inactive:', platformKey);
      return new Response(
        JSON.stringify({ error: 'Platform not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Read request body
    const rawBody = await req.text();
    const body: WebhookEvent = JSON.parse(rawBody);

    // Verify HMAC signature with current secret
    let isValid = await verifyHmacSignature(rawBody, signature, platform.webhook_secret, timestamp);

    // If current secret fails, try previous secret (during rotation window)
    if (!isValid && platform.previous_secret) {
      console.log('[Webhook Receiver] Trying previous secret...');
      isValid = await verifyHmacSignature(rawBody, signature, platform.previous_secret, timestamp);
    }

    if (!isValid) {
      console.error('[Webhook Receiver] HMAC signature verification failed');
      
      // Log failed attempt to webhook_audit
      await supabase
        .from('webhook_audit' as any)
        .insert({
          platform_id: platform.id,
          webhook_id: null,
          action: 'webhook_received_invalid',
          metadata: {
            platform_key: platformKey,
            delivery_id: deliveryId,
            trace_id: traceId,
            error: 'Invalid HMAC signature',
            timestamp: timestamp
          }
        });

      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Webhook Receiver] Signature verified for ${platformKey}`);

    // Store event receipt for idempotency
    const { error: receiptError } = await supabase
      .from('event_receipts' as any)
      .insert({
        event_id: deliveryId,
        event_type: body.event_type,
        source: body.source,
        trace_id: traceId || body.trace_id,
        payload: body.payload,
        received_at: new Date().toISOString(),
        status: 'received'
      });

    if (receiptError) {
      console.error('[Webhook Receiver] Failed to store event receipt:', receiptError);
    }

    // Log successful webhook receipt to audit
    await supabase
      .from('webhook_audit' as any)
      .insert({
        platform_id: platform.id,
        webhook_id: null,
        action: 'webhook_received',
        metadata: {
          platform_key: platformKey,
          delivery_id: deliveryId,
          trace_id: traceId || body.trace_id,
          event_type: body.event_type,
          event_id: body.event_id,
          source: body.source,
          timestamp: timestamp
        }
      });

    // Process the webhook event based on event_type
    console.log(`[Webhook Receiver] Processing event: ${body.event_type}`);
    
    switch (body.event_type) {
      case 'InventoryUpdated':
        // Update local cached inventory
        console.log('[Webhook Receiver] Processing InventoryUpdated event');
        // TODO: Implement inventory update logic
        break;
      
      case 'ItemOutOfStock':
        // Disable ordering for SKU
        console.log('[Webhook Receiver] Processing ItemOutOfStock event');
        // TODO: Implement out-of-stock logic
        break;
      
      case 'ItemRestocked':
        // Re-enable SKU ordering
        console.log('[Webhook Receiver] Processing ItemRestocked event');
        // TODO: Implement restock logic
        break;
      
      case 'OrderFulfilled':
        // Mark order as completed
        console.log('[Webhook Receiver] Processing OrderFulfilled event');
        // TODO: Implement order fulfillment logic
        break;
      
      default:
        console.log(`[Webhook Receiver] Unknown event type: ${body.event_type}`);
    }

    // Update receipt status to processed
    await supabase
      .from('event_receipts' as any)
      .update({ 
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .eq('event_id', deliveryId);

    return new Response(
      JSON.stringify({ 
        success: true,
        event_id: deliveryId,
        message: 'Webhook processed successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Webhook Receiver] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
