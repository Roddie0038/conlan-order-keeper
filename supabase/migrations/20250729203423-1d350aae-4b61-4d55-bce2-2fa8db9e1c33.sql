-- Phase 1: MTO Email Routing Fix - Clean and standardize ordering_email_recipients
-- Create backup of existing data
CREATE TABLE IF NOT EXISTS ordering_email_recipients_backup AS
SELECT * FROM ordering_email_recipients;

-- Delete existing MTO-related entries to avoid conflicts
DELETE FROM ordering_email_recipients 
WHERE notification_types @> ARRAY['mto']::text[] 
   OR email_type = 'order_confirmation';

-- Insert standardized MTO email recipients with correct "City Name NNN" format
INSERT INTO ordering_email_recipients (
  store_number, 
  recipient_email, 
  role, 
  email_type, 
  notification_types, 
  plant, 
  is_active, 
  created_at
) VALUES
  -- Grand Prairie 027
  ('Grand Prairie 027', 'tosborn@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Grand Prairie 027', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- Fort Worth 022  
  ('Fort Worth 022', 'jmartinez@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Fort Worth 022', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- Houston 028
  ('Houston 028', 'jhughes@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Houston 028', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- San Antonio 029
  ('San Antonio 029', 'agalloway@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('San Antonio 029', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- Oklahoma City 030
  ('Oklahoma City 030', 'shayward@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Oklahoma City 030', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- Little Rock 032
  ('Little Rock 032', 'sstewart@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Little Rock 032', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- Kansas City 033
  ('Kansas City 033', 'kthompson@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Kansas City 033', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- Laredo 035
  ('Laredo 035', 'dgonzalez@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Laredo 035', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- Tulsa 036
  ('Tulsa 036', 'dwilliams@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Tulsa 036', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  
  -- Austin 039
  ('Austin 039', 'borozco@conlantire.com', 'store_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Austin 039', 'crichard@conlantire.com', 'service_manager', 'order_confirmation', ARRAY['mto'], 'Grand Prairie 097', true, NOW())

ON CONFLICT DO NOTHING;

-- Verify trigger exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'mto_email_notification_trigger_v3'
  ) THEN
    RAISE NOTICE 'WARNING: mto_email_notification_trigger_v3 not found';
  ELSE
    RAISE NOTICE 'SUCCESS: mto_email_notification_trigger_v3 is active';
  END IF;
END $$;

-- Log migration completion
INSERT INTO notification_logs (
  order_id, 
  order_type, 
  notification_type, 
  recipient_email, 
  status, 
  platform,
  metadata
) VALUES (
  gen_random_uuid()::text,
  'system_maintenance',
  'database_migration',
  'system@conlantire.com',
  'completed',
  'ot_platform',
  jsonb_build_object(
    'migration_type', 'mto_email_routing_fix',
    'phase', 'database_cleanup_complete',
    'timestamp', NOW(),
    'records_inserted', 20,
    'backup_table', 'ordering_email_recipients_backup'
  )
);