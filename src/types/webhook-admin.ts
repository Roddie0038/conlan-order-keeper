export interface AppWebhook {
  id: string;
  name: string;
  description: string | null;
  endpoint_url: string;
  webhook_secret: string;
  previous_secret: string | null;
  secret_rotated_at: string | null;
  hmac_enabled: boolean;
  hmac_algorithm: string;
  rate_limit_per_minute: number;
  timeout_seconds: number;
  retry_enabled: boolean;
  max_retries: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WebhookEventSubscription {
  id: string;
  webhook_id: string;
  event_type: string;
  is_enabled: boolean;
  created_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string | null;
  event_type: string;
  idempotency_key: string | null;
  request_url: string;
  request_method: string;
  request_headers: Record<string, any> | null;
  request_body: Record<string, any> | null;
  request_timestamp: string;
  response_status: number | null;
  response_headers: Record<string, any> | null;
  response_body: string | null;
  duration_ms: number | null;
  success: boolean | null;
  error_message: string | null;
  hmac_signature: string | null;
  retry_count: number;
  created_at: string;
}

export interface WebhookAudit {
  id: string;
  webhook_id: string | null;
  user_id: string | null;
  user_email: string | null;
  action: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'ops_manager' | 'user';
  created_at: string;
}

export const EVENT_TYPES = [
  'order.created',
  'order.updated',
  'order.completed',
  'mto.created',
  'mto.updated',
  'wheel.created',
  'warranty.created',
  'user.sync',
  'cross_dock.created',
] as const;

export type EventType = typeof EVENT_TYPES[number];
