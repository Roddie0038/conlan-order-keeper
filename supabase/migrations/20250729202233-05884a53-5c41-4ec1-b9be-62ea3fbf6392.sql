-- PHASE 1: MTO Email Routing Fix - Database Cleanup and Standardization

-- Step 1: Back up existing table
CREATE TABLE ordering_email_recipients_backup AS
SELECT * FROM ordering_email_recipients;

-- Step 2: Delete problematic entries with inconsistent formats
DELETE FROM ordering_email_recipients
WHERE store_number ILIKE '%Grand Prairie%' OR
      store_number ILIKE '%Kansas%' OR
      store_number ILIKE '%Austin%' OR
      store_number ILIKE '%Houston%' OR
      store_number ILIKE '%Oklahoma%' OR
      store_number ILIKE '%Little Rock%' OR
      store_number ILIKE '%San Antonio%' OR
      store_number ILIKE '%Tulsa%' OR
      store_number ILIKE '%Fort Worth%' OR
      store_number ILIKE '%Laredo%' OR
      role NOT IN ('store_manager', 'service_manager', 'coordinator', 'admin') OR
      (email_type = 'order_confirmation' AND notification_types && ARRAY['mto']);

-- Step 3: Insert corrected entries with standardized format
INSERT INTO ordering_email_recipients (store_number, recipient_email, role, email_type, notification_types, plant, is_active, created_at)
VALUES
-- Austin 039
('039', 'borozco@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- Fort Worth 022
('022', 'jmartinez@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- Grand Prairie 027
('027', 'tosborn@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
('027', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- Houston 028
('028', 'jhughes@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
('028', 'eblais@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- Kansas City 033
('033', 'rjohnson@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
('033', 'lallen@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- Laredo 035
('035', 'hgamez@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
('035', 'lguerra@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- Little Rock 032
('032', 'jmilliken@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- Oklahoma City 030
('030', 'dbaumgardner@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
('030', 'bhunt@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- San Antonio 029
('029', 'rpetty@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
('029', 'pvallejo@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),

-- Tulsa 036
('036', 'kbrown@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW())

ON CONFLICT (store_number, recipient_email, role) 
DO UPDATE SET 
    notification_types = EXCLUDED.notification_types,
    is_active = true,
    updated_at = NOW();

-- Step 4: Verify MTO email notification trigger exists and is active
-- Check if trigger exists
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname ILIKE '%mto_email_notification%';

-- Ensure trigger is on mto_orders table
SELECT schemaname, tablename, triggername 
FROM pg_tables t
JOIN information_schema.triggers tr ON tr.event_object_table = t.tablename
WHERE tr.trigger_name ILIKE '%mto_email_notification%';

-- Step 5: Add comprehensive logging for email routing debugging
CREATE OR REPLACE FUNCTION log_mto_email_routing_debug(
    p_store_number text,
    p_lookup_result jsonb,
    p_error_details text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO notification_logs (
        order_id,
        order_type,
        notification_type,
        recipient_email,
        store,
        status,
        metadata,
        created_at
    ) VALUES (
        gen_random_uuid(),
        'mto',
        'routing_debug',
        'system@conlantire.com',
        p_store_number,
        CASE WHEN p_error_details IS NULL THEN 'success' ELSE 'failed' END,
        jsonb_build_object(
            'store_number', p_store_number,
            'lookup_result', p_lookup_result,
            'error_details', p_error_details,
            'timestamp', NOW()
        ),
        NOW()
    );
END;
$$;