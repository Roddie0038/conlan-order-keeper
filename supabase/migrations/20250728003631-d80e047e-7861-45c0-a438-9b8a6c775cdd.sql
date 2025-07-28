-- Phase 1: Fix Email Recipients for Store 027
-- Add proper email recipients for store 027 in store_email_recipients table
INSERT INTO store_email_recipients (store_number, recipient_email, role, email_type, is_active)
VALUES 
  ('027', 'crichard@conlantire.com', 'store_manager', 'mto', true),
  ('027', 'roderickdemarais@aol.com', 'admin', 'mto', true)
ON CONFLICT (store_number, recipient_email, email_type) 
DO UPDATE SET 
  is_active = true,
  role = EXCLUDED.role,
  updated_at = now();

-- Add to ordering_email_recipients for backward compatibility
INSERT INTO ordering_email_recipients (store_number, recipient_email, role, email_type, is_active)
VALUES 
  ('027', 'crichard@conlantire.com', 'store_manager', 'mto', true),
  ('027', 'roderickdemarais@aol.com', 'admin', 'mto', true)
ON CONFLICT (store_number, recipient_email, email_type) 
DO UPDATE SET 
  is_active = true,
  role = EXCLUDED.role;

-- Phase 5: Create automatic email trigger for MTO order insertions
CREATE OR REPLACE FUNCTION trigger_mto_email_notification_v2()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log the trigger attempt with detailed information
    INSERT INTO notification_logs (
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
        'mto',
        'mto_casings_needed',
        COALESCE(NEW.email, 'system@conlantire.com'),
        'store_manager',
        'triggered',
        NEW.plant,
        NEW.store,
        'ot_platform',
        jsonb_build_object(
            'trigger_source', 'database_after_insert_v2',
            'store_normalized', NEW.store,
            'product_number', NEW.product_number,
            'quantity', NEW.quantity,
            'timestamp', NEW.timestamp
        )
    );

    -- Call the mto-notification edge function
    PERFORM pg_net.http_post(
        url := 'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/mto-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
        ),
        body := jsonb_build_object(
            'orderRecord', jsonb_build_object(
                'id', NEW.id,
                'store', NEW.store,
                'plant', NEW.plant,
                'email', NEW.email,
                'name', NEW.name,
                'product_number', NEW.product_number,
                'quantity', NEW.quantity,
                'tire_size', NEW.tire_size,
                'tread', NEW.tread,
                'casing_grade', NEW.casing_grade,
                'status', NEW.status,
                'timestamp', NEW.timestamp
            ),
            'emailType', 'casings_needed',
            'triggerSource', 'database_after_insert_v2'
        )
    );

    RETURN NEW;
END;
$$;

-- Create trigger for MTO order email notifications
DROP TRIGGER IF EXISTS mto_email_notification_trigger ON mto_orders;
CREATE TRIGGER mto_email_notification_trigger
    AFTER INSERT ON mto_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_mto_email_notification_v2();