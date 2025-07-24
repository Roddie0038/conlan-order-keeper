-- COMPREHENSIVE STORE NORMALIZATION MIGRATION (Both Platforms) - FIXED
-- This migration implements store format standardization across all tables

-- First, drop the existing view to avoid conflicts
DROP VIEW IF EXISTS public.store_normalization_verification;

-- ===== PHASE 1: Enhanced normalize_store_format() Function =====
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
    
    -- Trim whitespace and convert to lowercase for comparison
    input_store := TRIM(input_store);
    
    -- Fort Worth 022 (Store 22) variants
    IF input_store ~* '^(22|022|store\s*22|fort\s*worth\s*22|forth\s*worth\s*22|fort\s*worth\s*022|fw\s*22|fw\s*022)$' THEN
        RETURN 'Fort Worth 022';
    END IF;
    
    -- Grand Prairie 027 (Store 27) variants  
    IF input_store ~* '^(27|027|store\s*27|grand\s*prairie\s*27|grand\s*prarie\s*27|grand\s*prairie\s*027|gp\s*27|gp\s*027)$' THEN
        RETURN 'Grand Prairie 027';
    END IF;
    
    -- Houston 028 (Store 28) variants
    IF input_store ~* '^(28|028|store\s*28|houston\s*28|houston\s*028|hou\s*28|hou\s*028)$' THEN
        RETURN 'Houston 028';
    END IF;
    
    -- San Antonio 029 (Store 29) variants
    IF input_store ~* '^(29|029|store\s*29|san\s*antonio\s*29|san\s*antonio\s*029|sa\s*29|sa\s*029)$' THEN
        RETURN 'San Antonio 029';
    END IF;
    
    -- Oklahoma City 030 (Store 30) variants
    IF input_store ~* '^(30|030|store\s*30|oklahoma\s*30|oklahoma\s*city\s*30|oklahoma\s*city\s*030|okc\s*30|okc\s*030)$' THEN
        RETURN 'Oklahoma City 030';
    END IF;
    
    -- Little Rock 032 (Store 32) variants
    IF input_store ~* '^(32|032|store\s*32|little\s*rock\s*32|little\s*rock\s*032|lr\s*32|lr\s*032)$' THEN
        RETURN 'Little Rock 032';
    END IF;
    
    -- Kansas City 033 (Store 33) variants
    IF input_store ~* '^(33|033|store\s*33|kansas\s*33|kansas\s*city\s*33|kansas\s*city\s*033|kc\s*33|kc\s*033)$' THEN
        RETURN 'Kansas City 033';
    END IF;
    
    -- Laredo 035 (Store 35) variants
    IF input_store ~* '^(35|035|store\s*35|laredo\s*35|laredo\s*035)$' THEN
        RETURN 'Laredo 035';
    END IF;
    
    -- Tulsa 036 (Store 36) variants
    IF input_store ~* '^(36|036|store\s*36|tulsa\s*36|tulsa\s*036)$' THEN
        RETURN 'Tulsa 036';
    END IF;
    
    -- Austin 039 (Store 39) variants
    IF input_store ~* '^(39|039|store\s*39|austin\s*39|austin\s*039)$' THEN
        RETURN 'Austin 039';
    END IF;
    
    -- If already in correct format, return as-is
    IF input_store IN ('Fort Worth 022', 'Grand Prairie 027', 'Houston 028', 'San Antonio 029', 'Oklahoma City 030', 'Little Rock 032', 'Kansas City 033', 'Laredo 035', 'Tulsa 036', 'Austin 039') THEN
        RETURN input_store;
    END IF;
    
    -- For unrecognized formats, return original
    RETURN input_store;
END;
$function$;

-- ===== PHASE 2: Trigger Implementation =====

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS normalize_store_trigger ON orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON mto_orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON wheel_orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON warranty_orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON ot_platform_users;
DROP TRIGGER IF EXISTS normalize_store_trigger ON platform_users;
DROP TRIGGER IF EXISTS normalize_store_trigger ON managers;
DROP TRIGGER IF EXISTS normalize_store_trigger ON ordering_email_logs;
DROP TRIGGER IF EXISTS normalize_store_trigger ON ordering_email_recipients;
DROP TRIGGER IF EXISTS normalize_store_trigger ON store_email_recipients;

-- Create unified trigger function
CREATE OR REPLACE FUNCTION public.trigger_normalize_store_format()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Handle different table structures
    IF TG_TABLE_NAME IN ('orders', 'mto_orders', 'wheel_orders', 'warranty_orders', 'ot_platform_users', 'platform_users') THEN
        IF NEW.store IS NOT NULL THEN
            NEW.store := public.normalize_store_format(NEW.store);
        END IF;
    ELSIF TG_TABLE_NAME IN ('managers', 'ordering_email_logs', 'ordering_email_recipients', 'store_email_recipients') THEN
        IF NEW.store_number IS NOT NULL THEN
            NEW.store_number := public.normalize_store_format(NEW.store_number);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Apply triggers to all relevant tables
CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON mto_orders
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON wheel_orders
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON warranty_orders
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON ot_platform_users
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON platform_users
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON managers
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON ordering_email_logs
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON ordering_email_recipients
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON store_email_recipients
    FOR EACH ROW EXECUTE FUNCTION trigger_normalize_store_format();

-- ===== PHASE 3: Historical Data Cleanup =====

-- Update Orders Table (Ordering + OT Platform)
UPDATE orders SET store = normalize_store_format(store) 
WHERE store IS NOT NULL AND store != normalize_store_format(store);

-- Update MTO Orders
UPDATE mto_orders SET store = normalize_store_format(store) 
WHERE store IS NOT NULL AND store != normalize_store_format(store);

-- Update Wheel Orders
UPDATE wheel_orders SET store = normalize_store_format(store) 
WHERE store IS NOT NULL AND store != normalize_store_format(store);

-- Update Warranty Orders
UPDATE warranty_orders SET store = normalize_store_format(store) 
WHERE store IS NOT NULL AND store != normalize_store_format(store);

-- Update OT Platform Users
UPDATE ot_platform_users SET store = normalize_store_format(store) 
WHERE store IS NOT NULL AND store != normalize_store_format(store);

-- Update Platform Users (if table exists)
UPDATE platform_users SET store = normalize_store_format(store) 
WHERE store IS NOT NULL AND store != normalize_store_format(store);

-- Update Managers Table (OT Platform)
UPDATE managers SET store_number = normalize_store_format(store_number) 
WHERE store_number IS NOT NULL AND store_number != normalize_store_format(store_number);

-- Update Ordering Email Logs (Ordering Platform)
UPDATE ordering_email_logs SET store_number = normalize_store_format(store_number) 
WHERE store_number IS NOT NULL AND store_number != normalize_store_format(store_number);

-- Update Ordering Email Recipients (Ordering Platform)
UPDATE ordering_email_recipients SET store_number = normalize_store_format(store_number) 
WHERE store_number IS NOT NULL AND store_number != normalize_store_format(store_number);

-- Update Store Email Recipients (OT Platform) - if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_email_recipients') THEN
        EXECUTE 'UPDATE store_email_recipients SET store_number = normalize_store_format(store_number) 
                 WHERE store_number IS NOT NULL AND store_number != normalize_store_format(store_number)';
    END IF;
END $$;

-- ===== PHASE 4: Validation View =====

-- Create verification view to audit normalization results
CREATE VIEW public.store_normalization_verification AS
SELECT 
    'orders' as table_name,
    'store' as column_name,
    store as store_value,
    normalize_store_format(store) as normalized_value,
    CASE 
        WHEN store = normalize_store_format(store) THEN 'NORMALIZED'
        ELSE 'NEEDS_UPDATE'
    END as status,
    COUNT(*) as record_count
FROM orders 
WHERE store IS NOT NULL
GROUP BY store, normalize_store_format(store)

UNION ALL

SELECT 
    'mto_orders' as table_name,
    'store' as column_name,
    store as store_value,
    normalize_store_format(store) as normalized_value,
    CASE 
        WHEN store = normalize_store_format(store) THEN 'NORMALIZED'
        ELSE 'NEEDS_UPDATE'
    END as status,
    COUNT(*) as record_count
FROM mto_orders 
WHERE store IS NOT NULL
GROUP BY store, normalize_store_format(store)

UNION ALL

SELECT 
    'managers' as table_name,
    'store_number' as column_name,
    store_number as store_value,
    normalize_store_format(store_number) as normalized_value,
    CASE 
        WHEN store_number = normalize_store_format(store_number) THEN 'NORMALIZED'
        ELSE 'NEEDS_UPDATE'
    END as status,
    COUNT(*) as record_count
FROM managers 
WHERE store_number IS NOT NULL
GROUP BY store_number, normalize_store_format(store_number)

UNION ALL

SELECT 
    'ot_platform_users' as table_name,
    'store' as column_name,
    store as store_value,
    normalize_store_format(store) as normalized_value,
    CASE 
        WHEN store = normalize_store_format(store) THEN 'NORMALIZED'
        ELSE 'NEEDS_UPDATE'
    END as status,
    COUNT(*) as record_count
FROM ot_platform_users 
WHERE store IS NOT NULL
GROUP BY store, normalize_store_format(store)

ORDER BY table_name, status DESC, record_count DESC;

-- Update has_store_access function to work with normalized format
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

-- Final verification message
SELECT 'Store normalization migration completed successfully. Run "SELECT * FROM store_normalization_verification WHERE status = ''NEEDS_UPDATE''" to check for any remaining issues.' as migration_status;