
-- Phase 1: Function Updates - Create unified normalize_store_format function
CREATE OR REPLACE FUNCTION public.normalize_store_format(input_store text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
    -- Handle null or empty input
    IF input_store IS NULL OR input_store = '' THEN
        RETURN input_store;
    END IF;
    
    -- Trim whitespace
    input_store := TRIM(input_store);
    
    -- Handle Store 22 variants specifically
    IF input_store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22', 'Fort Worth 022') THEN
        RETURN 'Fort Worth 022';
    END IF;
    
    -- If already in correct format, return as-is
    IF input_store = 'Fort Worth 022' THEN
        RETURN input_store;
    END IF;
    
    -- For other stores, return original for now (will be updated later)
    RETURN input_store;
END;
$function$;

-- Phase 2: Trigger Cleanup + Creation
-- Drop existing conflicting triggers
DROP TRIGGER IF EXISTS normalize_store_trigger ON orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON mto_orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON wheel_orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON warranty_orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON complaints;
DROP TRIGGER IF EXISTS trigger_normalize_store_number_for_email ON ordering_email_logs;
DROP TRIGGER IF EXISTS trigger_normalize_store_number_for_email ON ordering_email_recipients;

-- Create new unified trigger function
CREATE OR REPLACE FUNCTION public.trigger_normalize_store_format()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Handle orders table
    IF TG_TABLE_NAME = 'orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    -- Handle mto_orders table
    ELSIF TG_TABLE_NAME = 'mto_orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    -- Handle wheel_orders table
    ELSIF TG_TABLE_NAME = 'wheel_orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    -- Handle warranty_orders table
    ELSIF TG_TABLE_NAME = 'warranty_orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    -- Handle complaints table (different column name)
    ELSIF TG_TABLE_NAME = 'complaints' AND NEW.store_number IS NOT NULL THEN
        NEW.store_number := normalize_store_format(NEW.store_number);
    -- Handle managers table
    ELSIF TG_TABLE_NAME = 'managers' AND NEW.store_number IS NOT NULL THEN
        NEW.store_number := normalize_store_format(NEW.store_number);
    -- Handle ordering_email_logs table
    ELSIF TG_TABLE_NAME = 'ordering_email_logs' AND NEW.store_number IS NOT NULL THEN
        NEW.store_number := normalize_store_format(NEW.store_number);
    -- Handle ordering_email_recipients table
    ELSIF TG_TABLE_NAME = 'ordering_email_recipients' AND NEW.store_number IS NOT NULL THEN
        NEW.store_number := normalize_store_format(NEW.store_number);
    -- Handle ot_platform_users table
    ELSIF TG_TABLE_NAME = 'ot_platform_users' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create triggers for all tables
CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON mto_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON wheel_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON warranty_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON managers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON ordering_email_logs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON ordering_email_recipients
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON ot_platform_users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

-- Phase 3: Historical Data Cleanup
-- Update orders table
UPDATE orders 
SET store = 'Fort Worth 022' 
WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Update mto_orders table
UPDATE mto_orders 
SET store = 'Fort Worth 022' 
WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Update wheel_orders table
UPDATE wheel_orders 
SET store = 'Fort Worth 022' 
WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Update warranty_orders table
UPDATE warranty_orders 
SET store = 'Fort Worth 022' 
WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Update complaints table (uses store_number column)
UPDATE complaints 
SET store_number = 'Fort Worth 022' 
WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Update managers table
UPDATE managers 
SET store_number = 'Fort Worth 022' 
WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Update ordering_email_logs table
UPDATE ordering_email_logs 
SET store_number = 'Fort Worth 022' 
WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Update ordering_email_recipients table
UPDATE ordering_email_recipients 
SET store_number = 'Fort Worth 022' 
WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Update ot_platform_users table
UPDATE ot_platform_users 
SET store = 'Fort Worth 022' 
WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');

-- Phase 4: RLS Policy Check - Ensure has_store_access works with new format
-- The existing has_store_access function should work with the normalized format
-- Let's verify it handles the new format correctly
CREATE OR REPLACE FUNCTION public.has_store_access(target_store text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.ot_platform_users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'active'
    AND normalize_store_format(store) = normalize_store_format(target_store)
    AND role = 'store_manager'
  );
$function$;

-- Cleanup: Remove legacy normalize_store_name function if it exists
DROP FUNCTION IF EXISTS public.normalize_store_name(text);

-- Add helpful function to get record counts for verification
CREATE OR REPLACE FUNCTION public.get_store_22_record_counts()
RETURNS TABLE(
    table_name text,
    column_name text,
    fort_worth_022_count bigint,
    legacy_format_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 'orders'::text, 'store'::text, 
    (SELECT COUNT(*) FROM orders WHERE store = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM orders WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'))
  UNION ALL
  SELECT 'mto_orders'::text, 'store'::text,
    (SELECT COUNT(*) FROM mto_orders WHERE store = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM mto_orders WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'))
  UNION ALL
  SELECT 'wheel_orders'::text, 'store'::text,
    (SELECT COUNT(*) FROM wheel_orders WHERE store = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM wheel_orders WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'))
  UNION ALL
  SELECT 'warranty_orders'::text, 'store'::text,
    (SELECT COUNT(*) FROM warranty_orders WHERE store = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM warranty_orders WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'))
  UNION ALL
  SELECT 'complaints'::text, 'store_number'::text,
    (SELECT COUNT(*) FROM complaints WHERE store_number = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM complaints WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'))
  UNION ALL
  SELECT 'managers'::text, 'store_number'::text,
    (SELECT COUNT(*) FROM managers WHERE store_number = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM managers WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'))
  UNION ALL
  SELECT 'ordering_email_logs'::text, 'store_number'::text,
    (SELECT COUNT(*) FROM ordering_email_logs WHERE store_number = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM ordering_email_logs WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'))
  UNION ALL
  SELECT 'ordering_email_recipients'::text, 'store_number'::text,
    (SELECT COUNT(*) FROM ordering_email_recipients WHERE store_number = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM ordering_email_recipients WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'))
  UNION ALL
  SELECT 'ot_platform_users'::text, 'store'::text,
    (SELECT COUNT(*) FROM ot_platform_users WHERE store = 'Fort Worth 022'),
    (SELECT COUNT(*) FROM ot_platform_users WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22'));
$function$;
