-- Force drop any existing notification_queue objects
DROP VIEW IF EXISTS public.notification_queue CASCADE;
DROP TABLE IF EXISTS public.notification_queue CASCADE;

-- Create lightweight notification queue table from scratch
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

-- Add indexes
CREATE INDEX idx_notification_queue_pending 
ON public.notification_queue(created_at DESC) 
WHERE status = 'pending';

CREATE INDEX idx_notification_queue_order_id 
ON public.notification_queue(order_id);

-- Lightweight trigger function
CREATE OR REPLACE FUNCTION public.trigger_orders_queue_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    INSERT INTO public.notification_queue (
        order_id,
        order_type,
        event_type,
        metadata
    ) VALUES (
        NEW.id,
        'orders',
        'insert',
        jsonb_build_object(
            'store', NEW.store,
            'plant', NEW.plant,
            'status', NEW.status,
            'email', NEW.email
        )
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS orders_after_insert_notification ON public.orders;
CREATE TRIGGER orders_after_insert_notification
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_orders_queue_notification();