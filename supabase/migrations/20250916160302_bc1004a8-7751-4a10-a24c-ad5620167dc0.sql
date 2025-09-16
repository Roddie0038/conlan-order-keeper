-- Create just the indexes and trigger (table already exists)
CREATE INDEX IF NOT EXISTS idx_notification_queue_pending 
ON public.notification_queue(created_at DESC) 
WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_notification_queue_order_id 
ON public.notification_queue(order_id);

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

-- Background processing function with optimizations
CREATE OR REPLACE FUNCTION public.process_notification_queue_batch(batch_size INTEGER DEFAULT 10)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'net', 'pg_temp'
AS $$
DECLARE
    queue_record RECORD;
    processed_count INTEGER := 0;
    v_lock_key BIGINT;
    v_url TEXT := 'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller';
    v_secret TEXT;
    v_store_norm TEXT;
    v_idem TEXT;
    hdrs JSONB;
    payload_text TEXT;
    resp JSONB;
BEGIN
    -- Set timeout for heavy queries
    SET LOCAL statement_timeout = '15s';
    
    -- Get internal secret
    BEGIN
        SELECT value INTO v_secret FROM public.app_config WHERE key = 'internal_token';
    EXCEPTION WHEN OTHERS THEN
        v_secret := NULL;
    END;
    
    FOR queue_record IN 
        SELECT * FROM public.notification_queue 
        WHERE status = 'pending' 
        ORDER BY created_at ASC 
        LIMIT batch_size
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Use advisory lock to prevent concurrent processing of same record
        v_lock_key := abs(hashtext(queue_record.id::text));
        
        IF pg_try_advisory_lock(v_lock_key) THEN
            BEGIN
                -- Mark as processing
                UPDATE public.notification_queue 
                SET status = 'processing', 
                    attempts = attempts + 1
                WHERE id = queue_record.id;
                
                -- Process based on order type and event
                IF queue_record.order_type = 'orders' AND queue_record.event_type = 'insert' THEN
                    v_store_norm := normalize_store_format(queue_record.metadata->>'store');
                    v_idem := 'ordering_v4:' || queue_record.order_id::text || ':insert';
                    
                    -- Build headers
                    hdrs := jsonb_build_object('Content-Type', 'application/json');
                    IF v_secret IS NOT NULL THEN
                        hdrs := hdrs || jsonb_build_object('x-internal-secret', v_secret);
                    END IF;
                    
                    -- Build payload
                    payload_text := jsonb_build_object(
                        'email_type', 'transfer_request',
                        'store_number', v_store_norm,
                        'idempotency_key', v_idem,
                        'order_id', queue_record.order_id,
                        'plant', queue_record.metadata->>'plant',
                        'metadata', queue_record.metadata
                    )::text;
                    
                    -- Send notification
                    resp := public.safe_http_post(v_url, hdrs, payload_text, 5000);
                    
                    -- Log success
                    INSERT INTO public.notification_logs (
                        order_id, order_number, order_type, notification_type, 
                        recipient_email, recipient_role, status, plant, store, 
                        platform, metadata
                    ) VALUES (
                        queue_record.order_id::text,
                        queue_record.order_id::text,
                        'orders',
                        'transfer_request',
                        COALESCE(queue_record.metadata->>'email', 'system@conlanorders.com'),
                        'store_manager',
                        'sent',
                        queue_record.metadata->>'plant',
                        v_store_norm,
                        'ot_platform',
                        jsonb_build_object(
                            'queue_id', queue_record.id,
                            'response', resp,
                            'idempotency_key', v_idem
                        )
                    );
                END IF;
                
                -- Mark as completed
                UPDATE public.notification_queue 
                SET status = 'completed', 
                    processed_at = NOW()
                WHERE id = queue_record.id;
                
                processed_count := processed_count + 1;
                
            EXCEPTION WHEN OTHERS THEN
                -- Mark as failed
                UPDATE public.notification_queue 
                SET status = 'failed', 
                    error_message = SQLERRM
                WHERE id = queue_record.id;
            END;
            
            -- Release lock
            PERFORM pg_advisory_unlock(v_lock_key);
        END IF;
    END LOOP;
    
    RETURN processed_count;
END;
$$;