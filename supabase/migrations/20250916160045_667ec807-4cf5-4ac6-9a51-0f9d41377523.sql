-- Handle existing indexes gracefully and create the trigger function
DROP INDEX IF EXISTS public.idx_notification_queue_order_id;
DROP INDEX IF EXISTS public.idx_notification_queue_pending;

-- Create indexes for performance
CREATE INDEX idx_notification_queue_pending 
ON public.notification_queue(created_at DESC) 
WHERE status = 'pending';

CREATE INDEX idx_notification_queue_order_id 
ON public.notification_queue(order_id);

-- Create indexes on related tables for fast recipient lookups (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_recipients_store_role 
ON public.store_email_recipients(store_number, recipient_role) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ot_users_plant_role 
ON public.ot_platform_users(plant, role) 
WHERE status = 'active';

-- Lightweight trigger function for instant inserts
CREATE OR REPLACE FUNCTION public.trigger_orders_queue_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Simply enqueue the notification - no HTTP calls, no heavy processing
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
    -- Never fail the insert due to notification issues
    RETURN NEW;
END;
$$;

-- Create the AFTER INSERT trigger
DROP TRIGGER IF EXISTS orders_after_insert_notification ON public.orders;
CREATE TRIGGER orders_after_insert_notification
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_orders_queue_notification();