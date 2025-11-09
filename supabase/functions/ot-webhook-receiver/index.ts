import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-ot-signature, x-ot-timestamp, x-ot-delivery-id, x-trace-id',
};

interface OTWebhookEvent {
  event_id: string;
  event_type: string;
  source: string;
  timestamp: string;
  trace_id?: string;
  payload: Record<string, any>;
}

/**
 * Verify HMAC SHA-256 signature
 */
async function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  timestamp: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const signedPayload = `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return computedSignature === signature;
  } catch (error) {
    console.error('[OT Webhook] HMAC verification error:', error);
    return false;
  }
}

/**
 * Validate timestamp to prevent replay attacks
 * Allows 5-minute skew tolerance
 */
function validateTimestamp(timestamp: string, toleranceMinutes: number = 5): boolean {
  try {
    const eventTime = new Date(timestamp).getTime();
    const now = Date.now();
    const tolerance = toleranceMinutes * 60 * 1000;
    
    return Math.abs(now - eventTime) <= tolerance;
  } catch {
    return false;
  }
}

/**
 * Process InventoryUpdated event
 */
async function handleInventoryUpdated(
  supabase: any,
  event: OTWebhookEvent
): Promise<void> {
  const { product_number, plant, quantity, status } = event.payload;
  
  console.log(`[OT Webhook] Processing InventoryUpdated: ${product_number} @ ${plant}`);
  
  // Get current cached quantity
  const { data: existing } = await supabase
    .from('inventory_cache')
    .select('quantity')
    .eq('product_number', product_number)
    .eq('plant', plant)
    .single();
  
  // Upsert inventory cache
  const { error: cacheError } = await supabase
    .from('inventory_cache')
    .upsert({
      product_number,
      plant,
      quantity: quantity || 0,
      status: status || 'available',
      last_updated_at: new Date().toISOString(),
      sync_trace_id: event.trace_id,
      metadata: event.payload
    }, {
      onConflict: 'product_number,plant'
    });
  
  if (cacheError) {
    throw new Error(`Failed to update inventory cache: ${cacheError.message}`);
  }
  
  // Log the sync
  await supabase
    .from('inventory_sync_log')
    .insert({
      event_id: event.event_id,
      trace_id: event.trace_id,
      product_number,
      plant,
      old_quantity: existing?.quantity || 0,
      new_quantity: quantity || 0,
      sync_type: 'inventory_updated',
      metadata: event.payload
    });
  
  console.log(`[OT Webhook] ✅ Inventory updated: ${product_number}`);
}

/**
 * Process ItemOutOfStock event
 */
async function handleItemOutOfStock(
  supabase: any,
  event: OTWebhookEvent
): Promise<void> {
  const { product_number, plant } = event.payload;
  
  console.log(`[OT Webhook] Processing ItemOutOfStock: ${product_number} @ ${plant}`);
  
  const { data: existing } = await supabase
    .from('inventory_cache')
    .select('quantity')
    .eq('product_number', product_number)
    .eq('plant', plant)
    .single();
  
  // Update inventory cache to out of stock
  const { error } = await supabase
    .from('inventory_cache')
    .upsert({
      product_number,
      plant,
      quantity: 0,
      status: 'out_of_stock',
      last_updated_at: new Date().toISOString(),
      sync_trace_id: event.trace_id,
      metadata: event.payload
    }, {
      onConflict: 'product_number,plant'
    });
  
  if (error) {
    throw new Error(`Failed to mark item out of stock: ${error.message}`);
  }
  
  // Log the sync
  await supabase
    .from('inventory_sync_log')
    .insert({
      event_id: event.event_id,
      trace_id: event.trace_id,
      product_number,
      plant,
      old_quantity: existing?.quantity || 0,
      new_quantity: 0,
      sync_type: 'out_of_stock',
      metadata: event.payload
    });
  
  console.log(`[OT Webhook] ✅ Item marked out of stock: ${product_number}`);
}

/**
 * Process ItemRestocked event
 */
async function handleItemRestocked(
  supabase: any,
  event: OTWebhookEvent
): Promise<void> {
  const { product_number, plant, quantity } = event.payload;
  
  console.log(`[OT Webhook] Processing ItemRestocked: ${product_number} @ ${plant}`);
  
  const { data: existing } = await supabase
    .from('inventory_cache')
    .select('quantity')
    .eq('product_number', product_number)
    .eq('plant', plant)
    .single();
  
  // Update inventory cache with new stock
  const { error } = await supabase
    .from('inventory_cache')
    .upsert({
      product_number,
      plant,
      quantity: quantity || 0,
      status: 'available',
      last_updated_at: new Date().toISOString(),
      sync_trace_id: event.trace_id,
      metadata: event.payload
    }, {
      onConflict: 'product_number,plant'
    });
  
  if (error) {
    throw new Error(`Failed to restock item: ${error.message}`);
  }
  
  // Log the sync
  await supabase
    .from('inventory_sync_log')
    .insert({
      event_id: event.event_id,
      trace_id: event.trace_id,
      product_number,
      plant,
      old_quantity: existing?.quantity || 0,
      new_quantity: quantity || 0,
      sync_type: 'restocked',
      metadata: event.payload
    });
  
  console.log(`[OT Webhook] ✅ Item restocked: ${product_number}`);
}

/**
 * Process OrderFulfilled event
 */
async function handleOrderFulfilled(
  supabase: any,
  event: OTWebhookEvent
): Promise<void> {
  const { order_number, order_type } = event.payload;
  
  console.log(`[OT Webhook] Processing OrderFulfilled: ${order_number}`);
  
  // Determine which table to update based on order type
  let tableName = 'orders';
  if (order_type === 'mto') {
    tableName = 'mto_orders';
  } else if (order_type === 'wheel') {
    tableName = 'wheel_orders';
  } else if (order_type === 'warranty') {
    tableName = 'warranty_orders';
  }
  
  // Update order status to completed
  const { error } = await supabase
    .from(tableName)
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('order_number', order_number);
  
  if (error) {
    console.error(`[OT Webhook] Failed to update order ${order_number}:`, error);
    // Don't throw - order might not exist in our system yet
  } else {
    console.log(`[OT Webhook] ✅ Order marked completed: ${order_number}`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const otWebhookSecret = Deno.env.get('OT_WEBHOOK_SECRET');
    
    if (!otWebhookSecret) {
      console.error('[OT Webhook] Missing OT_WEBHOOK_SECRET');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Extract headers
    const signature = req.headers.get('x-ot-signature');
    const timestamp = req.headers.get('x-ot-timestamp');
    const deliveryId = req.headers.get('x-ot-delivery-id');
    const traceId = req.headers.get('x-trace-id');
    
    // Validate required headers
    if (!signature || !timestamp || !deliveryId) {
      console.error('[OT Webhook] Missing required headers');
      return new Response(
        JSON.stringify({ error: 'Missing required headers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate timestamp to prevent replay attacks
    if (!validateTimestamp(timestamp)) {
      console.error('[OT Webhook] Timestamp validation failed - possible replay attack');
      
      // Log security incident
      await supabase.from('webhook_audit').insert({
        action: 'webhook.replay_attack_detected',
        metadata: {
          delivery_id: deliveryId,
          timestamp,
          trace_id: traceId
        }
      });
      
      return new Response(
        JSON.stringify({ error: 'Invalid timestamp' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse and validate body
    const rawBody = await req.text();
    let event: OTWebhookEvent;
    
    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error('[OT Webhook] Invalid JSON payload');
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify HMAC signature
    const isValidSignature = await verifyHmacSignature(rawBody, signature, otWebhookSecret, timestamp);
    
    if (!isValidSignature) {
      console.error('[OT Webhook] Invalid HMAC signature');
      
      // Log security incident
      await supabase.from('webhook_audit').insert({
        action: 'webhook.invalid_signature',
        metadata: {
          event_id: event.event_id,
          delivery_id: deliveryId,
          trace_id: traceId,
          event_type: event.event_type
        }
      });
      
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Check for duplicate delivery (idempotency)
    const { data: existingReceipt } = await supabase
      .from('event_receipts')
      .select('id, status')
      .eq('event_id', event.event_id)
      .single();
    
    if (existingReceipt) {
      console.log(`[OT Webhook] Duplicate event detected: ${event.event_id} (status: ${existingReceipt.status})`);
      return new Response(
        JSON.stringify({ 
          message: 'Event already processed',
          receipt_id: existingReceipt.id,
          status: existingReceipt.status
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create event receipt
    const { error: receiptError } = await supabase
      .from('event_receipts')
      .insert({
        event_id: event.event_id,
        event_type: event.event_type,
        source: event.source || 'ot',
        trace_id: traceId || event.trace_id,
        payload: event.payload,
        status: 'received',
        received_at: new Date().toISOString()
      });
    
    if (receiptError) {
      console.error('[OT Webhook] Failed to create event receipt:', receiptError);
      throw new Error('Failed to create event receipt');
    }
    
    // Log successful receipt
    await supabase.from('webhook_audit').insert({
      action: 'webhook.event_received',
      metadata: {
        event_id: event.event_id,
        event_type: event.event_type,
        delivery_id: deliveryId,
        trace_id: traceId || event.trace_id
      }
    });
    
    console.log(`[OT Webhook] Processing event: ${event.event_type} (${event.event_id})`);
    
    // Process event based on type
    try {
      switch (event.event_type) {
        case 'InventoryUpdated':
          await handleInventoryUpdated(supabase, event);
          break;
          
        case 'ItemOutOfStock':
          await handleItemOutOfStock(supabase, event);
          break;
          
        case 'ItemRestocked':
          await handleItemRestocked(supabase, event);
          break;
          
        case 'OrderFulfilled':
          await handleOrderFulfilled(supabase, event);
          break;
          
        default:
          console.warn(`[OT Webhook] Unknown event type: ${event.event_type}`);
          // Mark as ignored
          await supabase
            .from('event_receipts')
            .update({ status: 'ignored' })
            .eq('event_id', event.event_id);
          
          return new Response(
            JSON.stringify({ message: 'Event type not supported' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }
      
      // Mark as processed
      const processingDuration = Date.now() - startTime;
      await supabase
        .from('event_receipts')
        .update({ 
          status: 'processed',
          processed_at: new Date().toISOString(),
          processing_duration_ms: processingDuration
        })
        .eq('event_id', event.event_id);
      
      console.log(`[OT Webhook] ✅ Event processed successfully in ${processingDuration}ms`);
      
      return new Response(
        JSON.stringify({ 
          message: 'Event processed successfully',
          event_id: event.event_id,
          processing_duration_ms: processingDuration
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (processingError) {
      console.error('[OT Webhook] Processing error:', processingError);
      
      // Mark as failed
      await supabase
        .from('event_receipts')
        .update({ 
          status: 'failed',
          error_message: processingError instanceof Error ? processingError.message : 'Unknown error'
        })
        .eq('event_id', event.event_id);
      
      // Add to DLQ
      await supabase
        .from('failed_webhooks')
        .insert({
          event_id: event.event_id,
          event_type: event.event_type,
          source: event.source || 'ot',
          trace_id: traceId || event.trace_id,
          payload: event.payload,
          error_message: processingError instanceof Error ? processingError.message : 'Unknown error',
          retry_count: 0,
          max_retries: 3
        });
      
      throw processingError;
    }
    
  } catch (error) {
    console.error('[OT Webhook] Fatal error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
