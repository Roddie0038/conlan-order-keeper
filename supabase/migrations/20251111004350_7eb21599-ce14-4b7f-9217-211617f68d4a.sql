-- Add missing columns to existing webhook_deliveries table
ALTER TABLE public.webhook_deliveries
ADD COLUMN IF NOT EXISTS outbox_id uuid,
ADD COLUMN IF NOT EXISTS attempt_no int;

-- Create index for outbox_id lookups
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_outbox
  ON public.webhook_deliveries(outbox_id, created_at DESC)
  WHERE outbox_id IS NOT NULL;

COMMENT ON COLUMN public.webhook_deliveries.outbox_id IS 'Reference to webhook_outbox.id for this delivery attempt';
COMMENT ON COLUMN public.webhook_deliveries.attempt_no IS 'Attempt number (retry_count + 1)';