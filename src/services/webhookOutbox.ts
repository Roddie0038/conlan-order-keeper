import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

/**
 * Webhook event types supported by the Ordering Platform
 */
export type WebhookEventType = 
  | 'OrderPlaced'
  | 'OrderCancelled'
  | 'OrderModified'
  | 'MTOOrderPlaced'
  | 'WheelOrderPlaced'
  | 'WarrantySubmitted'
  | 'CrossDockRequested';

/**
 * Base interface for all webhook events
 */
export interface WebhookEvent {
  event_id?: string;
  event_type: WebhookEventType;
  trace_id?: string;
  payload: Record<string, any>;
  max_retries?: number;
}

/**
 * Order event payload structure
 */
export interface OrderEventPayload {
  order_id: string | number;
  order_number: string;
  store: string;
  plant: string;
  product_number?: string;
  description?: string;
  quantity?: number;
  schedule_arrival?: string;
  status?: string;
  submitted_by_name?: string;
  submitted_by_email?: string;
  order_type?: string;
  metadata?: Record<string, any>;
}

/**
 * Result of enqueuing an event to the outbox
 */
export interface EnqueueResult {
  success: boolean;
  event_id?: string;
  error?: string;
}

/**
 * Enqueue a webhook event to the outbox for reliable delivery
 * 
 * @param event - The webhook event to enqueue
 * @returns Promise with the result of the enqueue operation
 */
export async function enqueueWebhookEvent(event: WebhookEvent): Promise<EnqueueResult> {
  try {
    const eventId = event.event_id || uuidv4();
    const traceId = event.trace_id || uuidv4();

    console.log(`[Webhook Outbox] Enqueuing ${event.event_type} event:`, eventId);

    const { data, error } = await supabase
      .from('webhook_outbox' as any)
      .insert({
        event_id: eventId,
        event_type: event.event_type,
        trace_id: traceId,
        payload: event.payload,
        status: 'pending',
        retry_count: 0,
        max_retries: event.max_retries || 3,
        created_at: new Date().toISOString()
      })
      .select('id, event_id')
      .single();

    if (error) {
      console.error(`[Webhook Outbox] Failed to enqueue event:`, error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log(`[Webhook Outbox] Successfully enqueued event: ${eventId}`);

    return {
      success: true,
      event_id: eventId
    };
  } catch (error) {
    console.error(`[Webhook Outbox] Unexpected error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Enqueue an OrderPlaced event
 * 
 * @param orderData - The order data to publish
 * @param traceId - Optional trace ID for distributed tracing
 * @returns Promise with the result of the enqueue operation
 */
export async function publishOrderPlaced(
  orderData: OrderEventPayload,
  traceId?: string
): Promise<EnqueueResult> {
  return enqueueWebhookEvent({
    event_type: 'OrderPlaced',
    trace_id: traceId,
    payload: {
      ...orderData,
      timestamp: new Date().toISOString(),
      source: 'ordering'
    }
  });
}

/**
 * Enqueue an OrderCancelled event
 * 
 * @param orderData - The order data to publish
 * @param reason - Optional cancellation reason
 * @param traceId - Optional trace ID for distributed tracing
 * @returns Promise with the result of the enqueue operation
 */
export async function publishOrderCancelled(
  orderData: OrderEventPayload,
  reason?: string,
  traceId?: string
): Promise<EnqueueResult> {
  return enqueueWebhookEvent({
    event_type: 'OrderCancelled',
    trace_id: traceId,
    payload: {
      ...orderData,
      cancellation_reason: reason,
      timestamp: new Date().toISOString(),
      source: 'ordering'
    }
  });
}

/**
 * Enqueue an OrderModified event
 * 
 * @param orderData - The updated order data
 * @param changes - Object describing what changed
 * @param traceId - Optional trace ID for distributed tracing
 * @returns Promise with the result of the enqueue operation
 */
export async function publishOrderModified(
  orderData: OrderEventPayload,
  changes: Record<string, { old: any; new: any }>,
  traceId?: string
): Promise<EnqueueResult> {
  return enqueueWebhookEvent({
    event_type: 'OrderModified',
    trace_id: traceId,
    payload: {
      ...orderData,
      changes,
      timestamp: new Date().toISOString(),
      source: 'ordering'
    }
  });
}

/**
 * Enqueue an MTO Order Placed event
 * 
 * @param mtoData - The MTO order data
 * @param traceId - Optional trace ID for distributed tracing
 * @returns Promise with the result of the enqueue operation
 */
export async function publishMTOOrderPlaced(
  mtoData: OrderEventPayload,
  traceId?: string
): Promise<EnqueueResult> {
  return enqueueWebhookEvent({
    event_type: 'MTOOrderPlaced',
    trace_id: traceId,
    payload: {
      ...mtoData,
      timestamp: new Date().toISOString(),
      source: 'ordering'
    }
  });
}

/**
 * Enqueue a Wheel Order Placed event
 * 
 * @param wheelData - The wheel order data
 * @param traceId - Optional trace ID for distributed tracing
 * @returns Promise with the result of the enqueue operation
 */
export async function publishWheelOrderPlaced(
  wheelData: OrderEventPayload,
  traceId?: string
): Promise<EnqueueResult> {
  return enqueueWebhookEvent({
    event_type: 'WheelOrderPlaced',
    trace_id: traceId,
    payload: {
      ...wheelData,
      timestamp: new Date().toISOString(),
      source: 'ordering'
    }
  });
}

/**
 * Enqueue a Warranty Submitted event
 * 
 * @param warrantyData - The warranty submission data
 * @param traceId - Optional trace ID for distributed tracing
 * @returns Promise with the result of the enqueue operation
 */
export async function publishWarrantySubmitted(
  warrantyData: OrderEventPayload,
  traceId?: string
): Promise<EnqueueResult> {
  return enqueueWebhookEvent({
    event_type: 'WarrantySubmitted',
    trace_id: traceId,
    payload: {
      ...warrantyData,
      timestamp: new Date().toISOString(),
      source: 'ordering'
    }
  });
}

/**
 * Enqueue a Cross Dock Requested event
 * 
 * @param crossDockData - The cross dock request data
 * @param traceId - Optional trace ID for distributed tracing
 * @returns Promise with the result of the enqueue operation
 */
export async function publishCrossDockRequested(
  crossDockData: OrderEventPayload,
  traceId?: string
): Promise<EnqueueResult> {
  return enqueueWebhookEvent({
    event_type: 'CrossDockRequested',
    trace_id: traceId,
    payload: {
      ...crossDockData,
      timestamp: new Date().toISOString(),
      source: 'ordering'
    }
  });
}

/**
 * Query outbox events by status
 * 
 * @param status - The status to filter by
 * @param limit - Maximum number of records to return
 * @returns Promise with the outbox events
 */
export async function getOutboxEventsByStatus(
  status: 'pending' | 'processing' | 'delivered' | 'failed',
  limit: number = 50
) {
  const { data, error } = await supabase
    .from('webhook_outbox' as any)
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`[Webhook Outbox] Error fetching events:`, error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Get failed outbox events that need attention
 * 
 * @param limit - Maximum number of records to return
 * @returns Promise with failed events
 */
export async function getFailedOutboxEvents(limit: number = 50) {
  const { data, error } = await supabase
    .from('webhook_outbox' as any)
    .select('*')
    .eq('status', 'failed')
    .gte('retry_count', 'max_retries')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`[Webhook Outbox] Error fetching failed events:`, error);
    return { data: null, error };
  }

  return { data, error: null };
}

/**
 * Retry a failed outbox event
 * 
 * @param eventId - The event ID to retry
 * @returns Promise with the result
 */
export async function retryOutboxEvent(eventId: string): Promise<EnqueueResult> {
  try {
    const { error } = await supabase
      .from('webhook_outbox' as any)
      .update({
        status: 'pending',
        retry_count: 0,
        next_retry_at: null,
        error_message: null
      })
      .eq('event_id', eventId);

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      event_id: eventId
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
