-- CORRECTED MTO Email Routing Fix - Verified recipient mappings
-- Create backup of existing data
CREATE TABLE IF NOT EXISTS ordering_email_recipients_backup AS
SELECT * FROM ordering_email_recipients;

-- Delete existing MTO-related entries to avoid conflicts
DELETE FROM ordering_email_recipients 
WHERE notification_types @> ARRAY['mto']::text[];

-- Insert verified MTO email recipients with correct store/role mappings
INSERT INTO ordering_email_recipients (
  store_number,
  recipient_email,
  role,
  notification_types,
  plant,
  is_active,
  created_at
) VALUES
  ('Austin 039', 'borozco@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Fort Worth 022', 'jmartinez@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Grand Prairie 027', 'crichard@conlantire.com', 'service_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Grand Prairie 027', 'tosborn@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Houston 028', 'jhughes@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Houston 028', 'eblais@conlantire.com', 'service_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Kansas City 033', 'lallen@conlantire.com', 'service_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Kansas City 033', 'rjohnson@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Laredo 035', 'hgamez@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Laredo 035', 'lguerra@conlantire.com', 'service_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Little Rock 032', 'jmilliken@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Oklahoma City 030', 'dbaumgardner@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Oklahoma City 030', 'bhunt@conlantire.com', 'service_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('San Antonio 029', 'rpetty@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('San Antonio 029', 'pvallejo@conlantire.com', 'service_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW()),
  ('Tulsa 036', 'kbrown@conlantire.com', 'store_manager', ARRAY['mto'], 'Grand Prairie 097', true, NOW())
ON CONFLICT (store_number, recipient_email, role)
DO UPDATE SET 
  notification_types = EXCLUDED.notification_types,
  is_active = true;

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
    'migration_type', 'corrected_mto_email_routing',
    'phase', 'verified_recipients_inserted',
    'timestamp', NOW(),
    'records_inserted', 16,
    'backup_table', 'ordering_email_recipients_backup'
  )
);