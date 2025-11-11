-- Update webhook_outbox to support 'retrying' status
ALTER TABLE public.webhook_outbox
DROP CONSTRAINT IF EXISTS webhook_outbox_status_check;

ALTER TABLE public.webhook_outbox
ADD CONSTRAINT webhook_outbox_status_check 
CHECK (status IN ('pending', 'processing', 'delivered', 'failed', 'retrying'));

-- Update index to include retrying status
DROP INDEX IF EXISTS idx_webhook_outbox_next_retry;

CREATE INDEX idx_webhook_outbox_next_retry ON public.webhook_outbox(next_retry_at) 
WHERE status IN ('pending', 'failed', 'retrying');

-- Add index for efficient force mode queries
CREATE INDEX idx_webhook_outbox_retrying ON public.webhook_outbox(status, next_retry_at)
WHERE status = 'retrying';

COMMENT ON COLUMN public.webhook_outbox.status IS 'Current status: pending, processing, delivered, failed, or retrying';