-- Ensure order_drafts table has proper partial unique index and constraints
-- This prevents duplicate active drafts per key (Deliverable 7)

-- Drop existing constraint if it exists
ALTER TABLE public.order_drafts DROP CONSTRAINT IF EXISTS order_drafts_draft_key_unique_when_not_submitted;

-- Create partial unique index: only one active draft per draft_key when submitted=false
DROP INDEX IF EXISTS idx_order_drafts_unique_active_key;
CREATE UNIQUE INDEX idx_order_drafts_unique_active_key 
ON public.order_drafts (draft_key) 
WHERE submitted = false;

-- Add telemetry logging table for draft operations
CREATE TABLE IF NOT EXISTS public.draft_telemetry_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event TEXT NOT NULL,
    user_id UUID,
    draft_key TEXT,
    store TEXT,
    plant TEXT,
    form_type TEXT,
    subtype TEXT,
    source TEXT,
    duration_ms INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on draft telemetry
ALTER TABLE public.draft_telemetry_log ENABLE ROW LEVEL SECURITY;

-- Create policy for telemetry logging
CREATE POLICY "System can insert telemetry logs" ON public.draft_telemetry_log
FOR INSERT WITH CHECK (true);

CREATE POLICY "Super admins can view telemetry logs" ON public.draft_telemetry_log
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.ot_platform_users 
        WHERE auth_user_id = auth.uid() 
        AND role IN ('super_admin', 'operations_manager')
        AND status = 'active'
    )
);

-- Update the order_drafts table to have better indexing
CREATE INDEX IF NOT EXISTS idx_order_drafts_user_form_updated 
ON public.order_drafts (author_user_id, form_type, updated_at DESC) 
WHERE submitted = false;

-- Add comments for documentation
COMMENT ON INDEX idx_order_drafts_unique_active_key IS 'Ensures only one active draft per draft_key (submitted=false)';
COMMENT ON TABLE public.draft_telemetry_log IS 'Tracks draft operations for monitoring and debugging';
COMMENT ON INDEX idx_order_drafts_user_form_updated IS 'Optimizes fallback restore queries by user and form type';