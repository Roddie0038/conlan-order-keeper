-- Drop all existing indexes first
DROP INDEX IF EXISTS public.idx_notification_queue_order_id CASCADE;
DROP INDEX IF EXISTS public.idx_notification_queue_pending CASCADE;
DROP INDEX IF EXISTS public.notification_queue_pkey CASCADE;

-- Drop and recreate the table completely
DROP VIEW IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;

-- Create the table
CREATE TABLE public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id BIGINT NOT NULL,
    order_type TEXT NOT NULL DEFAULT 'orders',
    event_type TEXT NOT NULL DEFAULT 'insert',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "System can manage notification queue" 
ON public.notification_queue 
FOR ALL 
USING (true) 
WITH CHECK (true);