-- Create just the lightweight trigger function and trigger without touching notification_queue
-- Create indexes on related tables for fast recipient lookups
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
    -- Simply log to notification_logs - no HTTP calls, no heavy processing
    INSERT INTO public.notification_logs (
        order_id,
        order_number,
        order_type,
        notification_type,
        recipient_email,
        recipient_role,
        status,
        plant,
        store,
        platform,
        metadata
    ) VALUES (
        NEW.id::text,
        NEW.id::text,
        'orders',
        'transfer_request',
        COALESCE(NEW.email, 'system@conlanorders.com'),
        'store_manager',
        'queued',
        NEW.plant,
        normalize_store_format(NEW.store),
        'ot_platform',
        jsonb_build_object(
            'trigger_source', 'db_after_insert_queue',
            'store', NEW.store,
            'plant', NEW.plant,
            'status', NEW.status,
            'email', NEW.email,
            'timestamp', NOW()
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