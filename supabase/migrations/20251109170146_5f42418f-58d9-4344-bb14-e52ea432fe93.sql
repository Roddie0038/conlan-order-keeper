-- Create event_receipts table for idempotency tracking of inbound webhook events
CREATE TABLE IF NOT EXISTS public.event_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  source TEXT NOT NULL,
  trace_id TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'received',
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  processing_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add check constraint for status
ALTER TABLE public.event_receipts
ADD CONSTRAINT event_receipts_status_check 
CHECK (status IN ('received', 'processed', 'failed', 'ignored'));

-- Create indexes for efficient querying
CREATE INDEX idx_event_receipts_event_id ON public.event_receipts(event_id);
CREATE INDEX idx_event_receipts_event_type ON public.event_receipts(event_type);
CREATE INDEX idx_event_receipts_source ON public.event_receipts(source);
CREATE INDEX idx_event_receipts_trace_id ON public.event_receipts(trace_id) 
WHERE trace_id IS NOT NULL;
CREATE INDEX idx_event_receipts_status ON public.event_receipts(status);
CREATE INDEX idx_event_receipts_received_at ON public.event_receipts(received_at DESC);

-- Enable Row Level Security
ALTER TABLE public.event_receipts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage event receipts"
ON public.event_receipts
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Service role can manage event receipts"
ON public.event_receipts
FOR ALL
USING (true)
WITH CHECK (true);

-- Add comments to table
COMMENT ON TABLE public.event_receipts IS 'Idempotency tracking for processed inbound webhook events from external platforms';

-- Add comments to columns
COMMENT ON COLUMN public.event_receipts.event_id IS 'Unique event identifier from the sender (used for idempotency)';
COMMENT ON COLUMN public.event_receipts.event_type IS 'Type of event (e.g., InventoryUpdated, ItemOutOfStock, OrderFulfilled)';
COMMENT ON COLUMN public.event_receipts.source IS 'Source platform that sent the event (e.g., inventory, ot, ordering)';
COMMENT ON COLUMN public.event_receipts.trace_id IS 'Distributed tracing correlation ID';
COMMENT ON COLUMN public.event_receipts.status IS 'Processing status: received, processed, failed, or ignored';
COMMENT ON COLUMN public.event_receipts.received_at IS 'Timestamp when the webhook was received';
COMMENT ON COLUMN public.event_receipts.processed_at IS 'Timestamp when processing completed';
COMMENT ON COLUMN public.event_receipts.processing_duration_ms IS 'Time taken to process the event in milliseconds';