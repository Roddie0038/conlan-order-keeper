
-- Phase 1: Enhanced Normalization Function for All Store Mappings
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
    
    -- Handle Fort Worth (Store 22) variants
    IF input_store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22', 'Fort Worth 022') THEN
        RETURN 'Fort Worth 022';
    END IF;
    
    -- Handle Grand Prairie (Store 27) variants
    IF input_store IN ('27', '027', 'Store 27', 'Grand Prairie 27', 'Grand Prairie 027') THEN
        RETURN 'Grand Prairie 027';
    END IF;
    
    -- Handle Houston (Store 28) variants
    IF input_store IN ('28', '028', 'Store 28', 'Houston 28', 'Houston 028') THEN
        RETURN 'Houston 028';
    END IF;
    
    -- Handle San Antonio (Store 29) variants
    IF input_store IN ('29', '029', 'Store 29', 'San Antonio 29', 'San Antonio 029') THEN
        RETURN 'San Antonio 029';
    END IF;
    
    -- Handle Oklahoma City (Store 30) variants
    IF input_store IN ('30', '030', 'Store 30', 'Oklahoma 30', 'Oklahoma City 30', 'Oklahoma City 030', 'OKC 30') THEN
        RETURN 'Oklahoma City 030';
    END IF;
    
    -- Handle Little Rock (Store 32) variants
    IF input_store IN ('32', '032', 'Store 32', 'Little Rock 32', 'Little Rock 032') THEN
        RETURN 'Little Rock 032';
    END IF;
    
    -- Handle Kansas City (Store 33) variants
    IF input_store IN ('33', '033', 'Store 33', 'Kansas 33', 'Kansas City 33', 'Kansas City 033') THEN
        RETURN 'Kansas City 033';
    END IF;
    
    -- Handle Laredo (Store 35) variants
    IF input_store IN ('35', '035', 'Store 35', 'Laredo 35', 'Laredo 035') THEN
        RETURN 'Laredo 035';
    END IF;
    
    -- Handle Tulsa (Store 36) variants
    IF input_store IN ('36', '036', 'Store 36', 'Tulsa 36', 'Tulsa 036') THEN
        RETURN 'Tulsa 036';
    END IF;
    
    -- Handle Austin (Store 39) variants
    IF input_store IN ('39', '039', 'Store 39', 'Austin 39', 'Austin 039') THEN
        RETURN 'Austin 039';
    END IF;
    
    -- If already in correct format, return as-is
    IF input_store IN ('Fort Worth 022', 'Grand Prairie 027', 'Houston 028', 'San Antonio 029', 'Oklahoma City 030', 'Little Rock 032', 'Kansas City 033', 'Laredo 035', 'Tulsa 036', 'Austin 039') THEN
        RETURN input_store;
    END IF;
    
    -- For other stores or unrecognized formats, return original
    RETURN input_store;
END;
$function$;

-- Phase 2: Update ot_platform_users table
UPDATE ot_platform_users 
SET store = normalize_store_format(store),
    plant = 'Grand Prairie 097'
WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22', 'Fort Worth 022',
                '27', '027', 'Store 27', 'Grand Prairie 27', 'Grand Prairie 027',
                '28', '028', 'Store 28', 'Houston 28', 'Houston 028',
                '29', '029', 'Store 29', 'San Antonio 29', 'San Antonio 029',
                '30', '030', 'Store 30', 'Oklahoma 30', 'Oklahoma City 30', 'Oklahoma City 030', 'OKC 30',
                '32', '032', 'Store 32', 'Little Rock 32', 'Little Rock 032',
                '33', '033', 'Store 33', 'Kansas 33', 'Kansas City 33', 'Kansas City 033',
                '35', '035', 'Store 35', 'Laredo 35', 'Laredo 035',
                '36', '036', 'Store 36', 'Tulsa 36', 'Tulsa 036',
                '39', '039', 'Store 39', 'Austin 39', 'Austin 039');

-- Phase 3: Update platform_users table (if exists)
UPDATE platform_users 
SET store = normalize_store_format(store),
    plant = 'Grand Prairie 097'
WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22', 'Fort Worth 022',
                '27', '027', 'Store 27', 'Grand Prairie 27', 'Grand Prairie 027',
                '28', '028', 'Store 28', 'Houston 28', 'Houston 028',
                '29', '029', 'Store 29', 'San Antonio 29', 'San Antonio 029',
                '30', '030', 'Store 30', 'Oklahoma 30', 'Oklahoma City 30', 'Oklahoma City 030', 'OKC 30',
                '32', '032', 'Store 32', 'Little Rock 32', 'Little Rock 032',
                '33', '033', 'Store 33', 'Kansas 33', 'Kansas City 33', 'Kansas City 033',
                '35', '035', 'Store 35', 'Laredo 35', 'Laredo 035',
                '36', '036', 'Store 36', 'Tulsa 36', 'Tulsa 036',
                '39', '039', 'Store 39', 'Austin 39', 'Austin 039');

-- Phase 4: Update profiles table (if exists)
UPDATE profiles 
SET store = normalize_store_format(store)
WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22', 'Fort Worth 022',
                '27', '027', 'Store 27', 'Grand Prairie 27', 'Grand Prairie 027',
                '28', '028', 'Store 28', 'Houston 28', 'Houston 028',
                '29', '029', 'Store 29', 'San Antonio 29', 'San Antonio 029',
                '30', '030', 'Store 30', 'Oklahoma 30', 'Oklahoma City 30', 'Oklahoma City 030', 'OKC 30',
                '32', '032', 'Store 32', 'Little Rock 32', 'Little Rock 032',
                '33', '033', 'Store 33', 'Kansas 33', 'Kansas City 33', 'Kansas City 033',
                '35', '035', 'Store 35', 'Laredo 35', 'Laredo 035',
                '36', '036', 'Store 36', 'Tulsa 36', 'Tulsa 036',
                '39', '039', 'Store 39', 'Austin 39', 'Austin 039');

-- Phase 5: Update managers table with store_number and plant_code normalization
UPDATE managers 
SET store_number = normalize_store_format(store_number),
    plant_code = 'Grand Prairie 097'
WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22', 'Fort Worth 022',
                       '27', '027', 'Store 27', 'Grand Prairie 27', 'Grand Prairie 027',
                       '28', '028', 'Store 28', 'Houston 28', 'Houston 028',
                       '29', '029', 'Store 29', 'San Antonio 29', 'San Antonio 029',
                       '30', '030', 'Store 30', 'Oklahoma 30', 'Oklahoma City 30', 'Oklahoma City 030', 'OKC 30',
                       '32', '032', 'Store 32', 'Little Rock 32', 'Little Rock 032',
                       '33', '033', 'Store 33', 'Kansas 33', 'Kansas City 33', 'Kansas City 033',
                       '35', '035', 'Store 35', 'Laredo 35', 'Laredo 035',
                       '36', '036', 'Store 36', 'Tulsa 36', 'Tulsa 036',
                       '39', '039', 'Store 39', 'Austin 39', 'Austin 039');

-- Phase 6: Update any remaining plant_code inconsistencies in managers
UPDATE managers 
SET plant_code = 'Grand Prairie 097'
WHERE plant_code IN ('99', '97', 'Grand Prairie 97', 'Grand Prairie 097') 
   OR plant_code IS NULL;

-- Phase 7: Update has_store_access function to use normalized comparison
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

-- Phase 8: Apply normalization triggers to user tables
CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

CREATE TRIGGER normalize_store_format_trigger
    BEFORE INSERT OR UPDATE ON platform_users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_format();

-- Phase 9: Verification queries to show results
SELECT 'ot_platform_users' as table_name, 
       COUNT(*) as total_records,
       COUNT(CASE WHEN store LIKE '% 0__' THEN 1 END) as normalized_stores,
       COUNT(CASE WHEN plant = 'Grand Prairie 097' THEN 1 END) as correct_plants
FROM ot_platform_users
WHERE store IS NOT NULL AND store != 'Unassigned'

UNION ALL

SELECT 'platform_users' as table_name,
       COUNT(*) as total_records,
       COUNT(CASE WHEN store LIKE '% 0__' THEN 1 END) as normalized_stores,
       COUNT(CASE WHEN plant = 'Grand Prairie 097' THEN 1 END) as correct_plants
FROM platform_users
WHERE store IS NOT NULL AND store != 'Unassigned'

UNION ALL

SELECT 'profiles' as table_name,
       COUNT(*) as total_records,
       COUNT(CASE WHEN store LIKE '% 0__' THEN 1 END) as normalized_stores,
       0 as correct_plants
FROM profiles
WHERE store IS NOT NULL AND store != 'Unassigned'

UNION ALL

SELECT 'managers' as table_name,
       COUNT(*) as total_records,
       COUNT(CASE WHEN store_number LIKE '% 0__' THEN 1 END) as normalized_stores,
       COUNT(CASE WHEN plant_code = 'Grand Prairie 097' THEN 1 END) as correct_plants
FROM managers
WHERE store_number IS NOT NULL AND store_number != 'Unassigned';
