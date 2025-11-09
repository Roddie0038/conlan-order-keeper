-- Create failed_webhooks table for DLQ (Dead Letter Queue)
CREATE TABLE IF NOT EXISTS public.failed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  trace_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT NOT NULL,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_retry_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT
);

-- Create indexes for failed_webhooks
CREATE INDEX idx_failed_webhooks_event_id ON public.failed_webhooks(event_id);
CREATE INDEX idx_failed_webhooks_event_type ON public.failed_webhooks(event_type);
CREATE INDEX idx_failed_webhooks_source ON public.failed_webhooks(source);
CREATE INDEX idx_failed_webhooks_next_retry ON public.failed_webhooks(next_retry_at) 
WHERE resolved_at IS NULL AND next_retry_at IS NOT NULL;
CREATE INDEX idx_failed_webhooks_created_at ON public.failed_webhooks(created_at DESC);

-- Create webhook_audit table for security and compliance
CREATE TABLE IF NOT EXISTS public.webhook_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID,
  platform_id UUID,
  user_id UUID,
  user_email TEXT,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for webhook_audit
CREATE INDEX idx_webhook_audit_webhook_id ON public.webhook_audit(webhook_id);
CREATE INDEX idx_webhook_audit_platform_id ON public.webhook_audit(platform_id);
CREATE INDEX idx_webhook_audit_action ON public.webhook_audit(action);
CREATE INDEX idx_webhook_audit_created_at ON public.webhook_audit(created_at DESC);

-- Create inventory_cache table for real-time sync
CREATE TABLE IF NOT EXISTS public.inventory_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_number TEXT NOT NULL,
  plant TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sync_trace_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_number, plant)
);

-- Create indexes for inventory_cache
CREATE INDEX idx_inventory_cache_product ON public.inventory_cache(product_number);
CREATE INDEX idx_inventory_cache_plant ON public.inventory_cache(plant);
CREATE INDEX idx_inventory_cache_status ON public.inventory_cache(status);
CREATE INDEX idx_inventory_cache_updated ON public.inventory_cache(last_updated_at DESC);

-- Create inventory_sync_log table for tracking sync events
CREATE TABLE IF NOT EXISTS public.inventory_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL,
  trace_id TEXT,
  product_number TEXT NOT NULL,
  plant TEXT NOT NULL,
  old_quantity INTEGER,
  new_quantity INTEGER,
  sync_type TEXT NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for inventory_sync_log
CREATE INDEX idx_inventory_sync_log_event_id ON public.inventory_sync_log(event_id);
CREATE INDEX idx_inventory_sync_log_trace_id ON public.inventory_sync_log(trace_id);
CREATE INDEX idx_inventory_sync_log_product ON public.inventory_sync_log(product_number, plant);
CREATE INDEX idx_inventory_sync_log_synced_at ON public.inventory_sync_log(synced_at DESC);

-- Enable RLS on all tables
ALTER TABLE public.failed_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for failed_webhooks
CREATE POLICY "Admins can manage failed webhooks"
ON public.failed_webhooks
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Service role can manage failed webhooks"
ON public.failed_webhooks
FOR ALL
USING (true)
WITH CHECK (true);

-- RLS policies for webhook_audit
CREATE POLICY "Admins can read webhook audit"
ON public.webhook_audit
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Service role can manage webhook audit"
ON public.webhook_audit
FOR ALL
USING (true)
WITH CHECK (true);

-- RLS policies for inventory_cache
CREATE POLICY "Authenticated users can read inventory cache"
ON public.inventory_cache
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage inventory cache"
ON public.inventory_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- RLS policies for inventory_sync_log
CREATE POLICY "Authenticated users can read sync log"
ON public.inventory_sync_log
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage sync log"
ON public.inventory_sync_log
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.failed_webhooks IS 'Dead Letter Queue for failed webhook deliveries requiring manual intervention';
COMMENT ON TABLE public.webhook_audit IS 'Audit trail for all webhook configuration changes and sensitive operations';
COMMENT ON TABLE public.inventory_cache IS 'Cached real-time inventory data synced from OT Platform';
COMMENT ON TABLE public.inventory_sync_log IS 'Historical log of all inventory synchronization events';

-- Add check constraint for inventory status
ALTER TABLE public.inventory_cache
ADD CONSTRAINT inventory_cache_status_check 
CHECK (status IN ('available', 'out_of_stock', 'discontinued', 'unknown'));