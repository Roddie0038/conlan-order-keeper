export interface AppPlatform {
  id: string;
  platform_key: string;
  platform_name: string;
  description: string | null;
  base_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppPlatformLink {
  id: string;
  platform_id: string;
  webhook_type: string;
  webhook_url: string;
  webhook_secret: string | null;
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

export interface WebhookDelivery {
  id: string;
  platform_link_id: string | null;
  webhook_type: string;
  webhook_url: string;
  request_method: string;
  request_headers: Record<string, any> | null;
  request_body: Record<string, any> | null;
  response_status: number | null;
  response_headers: Record<string, any> | null;
  response_body: string | null;
  duration_ms: number | null;
  success: boolean | null;
  error_message: string | null;
  idempotency_key: string | null;
  hmac_signature: string | null;
  retry_count: number;
  created_at: string;
}

export interface WebhookAnalytics {
  id: string;
  platform_link_id: string;
  date: string;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  avg_duration_ms: number;
  created_at: string;
}
