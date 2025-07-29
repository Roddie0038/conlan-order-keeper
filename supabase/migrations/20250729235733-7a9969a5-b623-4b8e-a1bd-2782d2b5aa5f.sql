-- COMPREHENSIVE ORDER_ID TYPE ALIGNMENT AND DATA CLEANUP
-- Pre-migration validation and backup creation

-- Step 1: Create backup tables for affected data
CREATE TABLE IF NOT EXISTS notification_logs_backup AS 
SELECT * FROM notification_logs;

CREATE TABLE IF NOT EXISTS notification_queue_backup AS 
SELECT * FROM notification_queue;

CREATE TABLE IF NOT EXISTS ordering_email_logs_backup AS 
SELECT * FROM ordering_email_logs;

-- Step 2: Analyze and log invalid data before cleanup
DO $$
DECLARE
    invalid_notification_logs_count INTEGER;
    invalid_notification_queue_count INTEGER;
    invalid_ordering_email_logs_count INTEGER;
BEGIN
    -- Count invalid order_ids in notification_logs
    SELECT COUNT(*) INTO invalid_notification_logs_count
    FROM notification_logs 
    WHERE order_id IS NOT NULL 
    AND order_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Count invalid order_ids in notification_queue
    SELECT COUNT(*) INTO invalid_notification_queue_count
    FROM notification_queue 
    WHERE order_id IS NOT NULL 
    AND order_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    -- Count invalid order_ids in ordering_email_logs
    SELECT COUNT(*) INTO invalid_ordering_email_logs_count
    FROM ordering_email_logs 
    WHERE order_id IS NOT NULL 
    AND order_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
    
    RAISE NOTICE 'PRE-MIGRATION AUDIT:';
    RAISE NOTICE 'Invalid notification_logs.order_id records: %', invalid_notification_logs_count;
    RAISE NOTICE 'Invalid notification_queue.order_id records: %', invalid_notification_queue_count;
    RAISE NOTICE 'Invalid ordering_email_logs.order_id records: %', invalid_ordering_email_logs_count;
END $$;

-- Step 3: Make notification_logs.order_id nullable and clean invalid data
ALTER TABLE notification_logs ALTER COLUMN order_id DROP NOT NULL;

-- Clean invalid UUID strings in notification_logs
UPDATE notification_logs 
SET order_id = NULL 
WHERE order_id IS NOT NULL 
AND order_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 4: Convert notification_queue.order_id from TEXT to UUID
-- First, clean invalid UUIDs
UPDATE notification_queue 
SET order_id = NULL 
WHERE order_id IS NOT NULL 
AND order_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Convert valid UUIDs and make column nullable
ALTER TABLE notification_queue ALTER COLUMN order_id TYPE UUID USING 
  CASE 
    WHEN order_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN order_id::UUID 
    ELSE NULL 
  END;

ALTER TABLE notification_queue ALTER COLUMN order_id DROP NOT NULL;

-- Step 5: Convert ordering_email_logs.order_id from TEXT to UUID
-- First, clean invalid UUIDs
UPDATE ordering_email_logs 
SET order_id = NULL 
WHERE order_id IS NOT NULL 
AND order_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Convert valid UUIDs and make column nullable
ALTER TABLE ordering_email_logs ALTER COLUMN order_id TYPE UUID USING 
  CASE 
    WHEN order_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN order_id::UUID 
    ELSE NULL 
  END;

ALTER TABLE ordering_email_logs ALTER COLUMN order_id DROP NOT NULL;

-- Step 6: Add performance indexes
CREATE INDEX IF NOT EXISTS idx_notification_logs_order_id ON notification_logs(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notification_queue_order_id ON notification_queue(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordering_email_logs_order_id ON ordering_email_logs(order_id) WHERE order_id IS NOT NULL;

-- Step 7: Add validation constraints to prevent future issues
-- Note: Using triggers instead of CHECK constraints for better flexibility
CREATE OR REPLACE FUNCTION validate_order_id_uuid() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_id IS NOT NULL AND NEW.order_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'order_id must be a valid UUID or NULL, got: %', NEW.order_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation triggers
DROP TRIGGER IF EXISTS validate_notification_logs_order_id ON notification_logs;
CREATE TRIGGER validate_notification_logs_order_id 
  BEFORE INSERT OR UPDATE ON notification_logs 
  FOR EACH ROW EXECUTE FUNCTION validate_order_id_uuid();

DROP TRIGGER IF EXISTS validate_notification_queue_order_id ON notification_queue;
CREATE TRIGGER validate_notification_queue_order_id 
  BEFORE INSERT OR UPDATE ON notification_queue 
  FOR EACH ROW EXECUTE FUNCTION validate_order_id_uuid();

DROP TRIGGER IF EXISTS validate_ordering_email_logs_order_id ON ordering_email_logs;
CREATE TRIGGER validate_ordering_email_logs_order_id 
  BEFORE INSERT OR UPDATE ON ordering_email_logs 
  FOR EACH ROW EXECUTE FUNCTION validate_order_id_uuid();

-- Step 8: Post-migration validation report
DO $$
DECLARE
    notification_logs_total INTEGER;
    notification_logs_null INTEGER;
    notification_logs_valid INTEGER;
    notification_queue_total INTEGER;
    notification_queue_null INTEGER;
    notification_queue_valid INTEGER;
    ordering_email_logs_total INTEGER;
    ordering_email_logs_null INTEGER;
    ordering_email_logs_valid INTEGER;
BEGIN
    -- Validate notification_logs
    SELECT COUNT(*) INTO notification_logs_total FROM notification_logs;
    SELECT COUNT(*) INTO notification_logs_null FROM notification_logs WHERE order_id IS NULL;
    SELECT COUNT(*) INTO notification_logs_valid FROM notification_logs WHERE order_id IS NOT NULL;
    
    -- Validate notification_queue
    SELECT COUNT(*) INTO notification_queue_total FROM notification_queue;
    SELECT COUNT(*) INTO notification_queue_null FROM notification_queue WHERE order_id IS NULL;
    SELECT COUNT(*) INTO notification_queue_valid FROM notification_queue WHERE order_id IS NOT NULL;
    
    -- Validate ordering_email_logs
    SELECT COUNT(*) INTO ordering_email_logs_total FROM ordering_email_logs;
    SELECT COUNT(*) INTO ordering_email_logs_null FROM ordering_email_logs WHERE order_id IS NULL;
    SELECT COUNT(*) INTO ordering_email_logs_valid FROM ordering_email_logs WHERE order_id IS NOT NULL;
    
    RAISE NOTICE 'POST-MIGRATION VALIDATION REPORT:';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'notification_logs: Total=%, NULL=%, Valid UUIDs=%', notification_logs_total, notification_logs_null, notification_logs_valid;
    RAISE NOTICE 'notification_queue: Total=%, NULL=%, Valid UUIDs=%', notification_queue_total, notification_queue_null, notification_queue_valid;
    RAISE NOTICE 'ordering_email_logs: Total=%, NULL=%, Valid UUIDs=%', ordering_email_logs_total, ordering_email_logs_null, ordering_email_logs_valid;
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
    RAISE NOTICE 'All order_id columns are now UUID type and nullable';
    RAISE NOTICE 'Validation triggers installed to prevent future type errors';
    RAISE NOTICE 'Performance indexes created for order_id lookups';
    RAISE NOTICE 'Backup tables created: notification_logs_backup, notification_queue_backup, ordering_email_logs_backup';
END $$;