-- Create webhook_outbox table for transactional outbox pattern
CREATE TABLE IF NOT EXISTS public.webhook_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL UNIQUE,
  trace_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraint for status
ALTER TABLE public.webhook_outbox
ADD CONSTRAINT webhook_outbox_status_check 
CHECK (status IN ('pending', 'processing', 'delivered', 'failed'));

-- Add check constraint for retry_count
ALTER TABLE public.webhook_outbox
ADD CONSTRAINT webhook_outbox_retry_count_check 
CHECK (retry_count >= 0 AND retry_count <= max_retries);

-- Create indexes for efficient querying
CREATE INDEX idx_webhook_outbox_status ON public.webhook_outbox(status);
CREATE INDEX idx_webhook_outbox_event_type ON public.webhook_outbox(event_type);
CREATE INDEX idx_webhook_outbox_next_retry ON public.webhook_outbox(next_retry_at) 
WHERE status IN ('pending', 'failed');
CREATE INDEX idx_webhook_outbox_created_at ON public.webhook_outbox(created_at);
CREATE INDEX idx_webhook_outbox_trace_id ON public.webhook_outbox(trace_id) 
WHERE trace_id IS NOT NULL;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_webhook_outbox_updated_at
BEFORE UPDATE ON public.webhook_outbox
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.webhook_outbox ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage webhook outbox"
ON public.webhook_outbox
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Service role can manage webhook outbox"
ON public.webhook_outbox
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comment to table
COMMENT ON TABLE public.webhook_outbox IS 'Transactional outbox for reliable webhook event delivery to external platforms';

-- Add comments to columns
COMMENT ON COLUMN public.webhook_outbox.event_type IS 'Type of event (e.g., OrderPlaced, OrderCancelled, OrderModified)';
COMMENT ON COLUMN public.webhook_outbox.event_id IS 'Unique identifier for this event (idempotency key)';
COMMENT ON COLUMN public.webhook_outbox.trace_id IS 'Distributed tracing correlation ID';
COMMENT ON COLUMN public.webhook_outbox.status IS 'Current status: pending, processing, delivered, or failed';
COMMENT ON COLUMN public.webhook_outbox.retry_count IS 'Number of delivery attempts made';
COMMENT ON COLUMN public.webhook_outbox.max_retries IS 'Maximum number of retries before giving up';
COMMENT ON COLUMN public.webhook_outbox.next_retry_at IS 'Timestamp for next retry attempt (exponential backoff)';
COMMENT ON COLUMN public.webhook_outbox.delivered_at IS 'Timestamp when successfully delivered to all configured webhooks';