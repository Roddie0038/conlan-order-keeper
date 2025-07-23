-- COMPREHENSIVE PLANT AND STORE NORMALIZATION MIGRATION
-- Phase 1: Fix Legacy Store Values in All Tables

-- Fix orders table legacy store formats
UPDATE orders SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2');
UPDATE orders SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE orders SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE orders SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE orders SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE orders SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE orders SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE orders SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE orders SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE orders SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

-- Fix mto_orders table legacy store formats
UPDATE mto_orders SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2');
UPDATE mto_orders SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE mto_orders SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE mto_orders SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE mto_orders SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE mto_orders SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE mto_orders SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE mto_orders SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE mto_orders SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE mto_orders SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

-- Fix wheel_orders table legacy store formats
UPDATE wheel_orders SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2');
UPDATE wheel_orders SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE wheel_orders SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE wheel_orders SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE wheel_orders SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE wheel_orders SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE wheel_orders SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE wheel_orders SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE wheel_orders SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE wheel_orders SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

-- Fix warranty_orders table legacy store formats
UPDATE warranty_orders SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2');
UPDATE warranty_orders SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE warranty_orders SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE warranty_orders SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE warranty_orders SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE warranty_orders SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE warranty_orders SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE warranty_orders SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE warranty_orders SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE warranty_orders SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

-- Fix platform_users table legacy store formats
UPDATE platform_users SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2');
UPDATE platform_users SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE platform_users SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE platform_users SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE platform_users SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE platform_users SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE platform_users SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE platform_users SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE platform_users SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE platform_users SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

-- Fix ot_platform_users table legacy store formats
UPDATE ot_platform_users SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2');
UPDATE ot_platform_users SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE ot_platform_users SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE ot_platform_users SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE ot_platform_users SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE ot_platform_users SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE ot_platform_users SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE ot_platform_users SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE ot_platform_users SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE ot_platform_users SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

-- Fix managers table legacy store formats
UPDATE managers SET store_number = 'Fort Worth 022' WHERE store_number IN ('Store 02', '02', 'Store 2');
UPDATE managers SET store_number = 'Grand Prairie 027' WHERE store_number IN ('Store 27', '27');
UPDATE managers SET store_number = 'Houston 028' WHERE store_number IN ('Store 28', '28');
UPDATE managers SET store_number = 'San Antonio 029' WHERE store_number IN ('Store 29', '29');
UPDATE managers SET store_number = 'Oklahoma City 030' WHERE store_number IN ('Store 30', '30');
UPDATE managers SET store_number = 'Little Rock 032' WHERE store_number IN ('Store 32', '32');
UPDATE managers SET store_number = 'Kansas City 033' WHERE store_number IN ('Store 33', '33');
UPDATE managers SET store_number = 'Laredo 035' WHERE store_number IN ('Store 35', '35');
UPDATE managers SET store_number = 'Tulsa 036' WHERE store_number IN ('Store 36', '36');
UPDATE managers SET store_number = 'Austin 039' WHERE store_number IN ('Store 39', '39');

-- Phase 2: Fix Legacy Plant Values
UPDATE managers SET plant_code = 'Romulus 098' WHERE plant_code = '98';
UPDATE orders SET plant = 'Grand Prairie 097' WHERE plant = 'Grand Prairie 97';
UPDATE platform_users SET plant = 'Grand Prairie 097' WHERE plant IN ('Admin', 'Unknown');
UPDATE orders SET store = 'Fort Worth 022', plant = 'Grand Prairie 097' WHERE store = 'Store 00';

-- Phase 3: Enhanced Plant Normalization Function
CREATE OR REPLACE FUNCTION public.normalize_plant_name(input_plant text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
    IF input_plant IS NULL OR input_plant = '' THEN
        RETURN 'Grand Prairie 097'; -- Default fallback
    END IF;
    
    -- Trim whitespace and convert to lowercase for comparison
    input_plant := TRIM(lower(input_plant));
    
    -- Handle Grand Prairie variations (including legacy formats)
    IF input_plant IN ('grand prairie 97', 'grand prairie 097', 'grand prairie', 'gp 97', 'gp 097', '97', '097') THEN 
        RETURN 'Grand Prairie 097';
    END IF;
    
    -- Handle Mulberry variations (including legacy formats)
    IF input_plant IN ('mulberry 99', 'mulberry 099', 'mulberry', 'mb 99', 'mb 099', '99', '099') THEN 
        RETURN 'Mulberry 099';
    END IF;
    
    -- Handle Romulus variations (including legacy formats)
    IF input_plant IN ('romulus 98', 'romulus 098', 'romulus', 'rom 98', 'rom 098', '98', '098') THEN 
        RETURN 'Romulus 098';
    END IF;
    
    -- Handle special cases
    IF input_plant IN ('all plants', 'all', 'admin') THEN 
        RETURN 'All Plants';
    END IF;
    
    -- Handle unknown/invalid cases - default to Grand Prairie
    IF input_plant IN ('unknown', '', 'null') THEN
        RETURN 'Grand Prairie 097';
    END IF;
    
    -- If input already matches correct format (case-insensitive check), return proper case
    IF input_plant = 'grand prairie 097' THEN RETURN 'Grand Prairie 097'; END IF;
    IF input_plant = 'mulberry 099' THEN RETURN 'Mulberry 099'; END IF;
    IF input_plant = 'romulus 098' THEN RETURN 'Romulus 098'; END IF;
    IF input_plant = 'all plants' THEN RETURN 'All Plants'; END IF;
    
    -- Default fallback for any unrecognized format
    RETURN 'Grand Prairie 097';
END;
$function$;

-- Phase 4: Apply normalization to all existing plant data
UPDATE orders SET plant = normalize_plant_name(plant) WHERE plant IS NOT NULL;
UPDATE platform_users SET plant = normalize_plant_name(plant) WHERE plant IS NOT NULL;
UPDATE managers SET plant_code = normalize_plant_name(plant_code) WHERE plant_code IS NOT NULL;
UPDATE ot_platform_users SET plant = normalize_plant_name(plant) WHERE plant IS NOT NULL;

-- Phase 5: Apply store normalization to all existing store data
UPDATE orders SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE mto_orders SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE wheel_orders SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE warranty_orders SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE platform_users SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE ot_platform_users SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE managers SET store_number = normalize_store_format(store_number) WHERE store_number IS NOT NULL;

-- Phase 6: Enhanced Validation Trigger Function
CREATE OR REPLACE FUNCTION public.validate_plant_and_store_format()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Normalize plant names
    IF TG_TABLE_NAME = 'ot_platform_users' AND NEW.plant IS NOT NULL THEN
        NEW.plant := normalize_plant_name(NEW.plant);
        IF NEW.plant NOT IN ('Grand Prairie 097', 'Mulberry 099', 'Romulus 098', 'All Plants') THEN
            RAISE EXCEPTION 'Invalid plant name: %. Must be one of: Grand Prairie 097, Mulberry 099, Romulus 098, All Plants', NEW.plant;
        END IF;
    ELSIF TG_TABLE_NAME = 'platform_users' AND NEW.plant IS NOT NULL THEN
        NEW.plant := normalize_plant_name(NEW.plant);
        IF NEW.plant NOT IN ('Grand Prairie 097', 'Mulberry 099', 'Romulus 098', 'All Plants') THEN
            RAISE EXCEPTION 'Invalid plant name: %. Must be one of: Grand Prairie 097, Mulberry 099, Romulus 098, All Plants', NEW.plant;
        END IF;
    ELSIF TG_TABLE_NAME = 'orders' AND NEW.plant IS NOT NULL THEN
        NEW.plant := normalize_plant_name(NEW.plant);
        IF NEW.plant NOT IN ('Grand Prairie 097', 'Mulberry 099', 'Romulus 098', 'All Plants') THEN
            RAISE EXCEPTION 'Invalid plant name: %. Must be one of: Grand Prairie 097, Mulberry 099, Romulus 098, All Plants', NEW.plant;
        END IF;
    ELSIF TG_TABLE_NAME = 'managers' AND NEW.plant_code IS NOT NULL THEN
        NEW.plant_code := normalize_plant_name(NEW.plant_code);
        IF NEW.plant_code NOT IN ('Grand Prairie 097', 'Mulberry 099', 'Romulus 098', 'All Plants') THEN
            RAISE EXCEPTION 'Invalid plant name: %. Must be one of: Grand Prairie 097, Mulberry 099, Romulus 098, All Plants', NEW.plant_code;
        END IF;
    END IF;
    
    -- Normalize store formats
    IF TG_TABLE_NAME = 'orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    ELSIF TG_TABLE_NAME = 'mto_orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    ELSIF TG_TABLE_NAME = 'wheel_orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    ELSIF TG_TABLE_NAME = 'warranty_orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    ELSIF TG_TABLE_NAME = 'platform_users' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    ELSIF TG_TABLE_NAME = 'ot_platform_users' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_format(NEW.store);
    ELSIF TG_TABLE_NAME = 'managers' AND NEW.store_number IS NOT NULL THEN
        NEW.store_number := normalize_store_format(NEW.store_number);
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Drop existing validation triggers if they exist
DROP TRIGGER IF EXISTS validate_plant_name_trigger ON ot_platform_users;
DROP TRIGGER IF EXISTS validate_plant_name_trigger ON platform_users;
DROP TRIGGER IF EXISTS validate_plant_name_trigger ON orders;
DROP TRIGGER IF EXISTS validate_plant_name_trigger ON managers;

-- Create comprehensive validation triggers
CREATE TRIGGER validate_plant_and_store_trigger
    BEFORE INSERT OR UPDATE ON ot_platform_users
    FOR EACH ROW EXECUTE FUNCTION validate_plant_and_store_format();

CREATE TRIGGER validate_plant_and_store_trigger
    BEFORE INSERT OR UPDATE ON platform_users
    FOR EACH ROW EXECUTE FUNCTION validate_plant_and_store_format();

CREATE TRIGGER validate_plant_and_store_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION validate_plant_and_store_format();

CREATE TRIGGER validate_plant_and_store_trigger
    BEFORE INSERT OR UPDATE ON managers
    FOR EACH ROW EXECUTE FUNCTION validate_plant_and_store_format();

CREATE TRIGGER validate_plant_and_store_trigger
    BEFORE INSERT OR UPDATE ON mto_orders
    FOR EACH ROW EXECUTE FUNCTION validate_plant_and_store_format();

CREATE TRIGGER validate_plant_and_store_trigger
    BEFORE INSERT OR UPDATE ON wheel_orders
    FOR EACH ROW EXECUTE FUNCTION validate_plant_and_store_format();

CREATE TRIGGER validate_plant_and_store_trigger
    BEFORE INSERT OR UPDATE ON warranty_orders
    FOR EACH ROW EXECUTE FUNCTION validate_plant_and_store_format();

-- Phase 7: Final Validation Queries
-- This will show any remaining invalid entries after normalization
SELECT 'VALIDATION_SUMMARY' as check_type, 'Checking all tables for invalid plant/store formats' as description

UNION ALL

SELECT 'ot_platform_users_invalid_plants' as check_type, 
       CASE WHEN count(*) = 0 THEN 'PASS - No invalid plants' 
            ELSE 'FAIL - ' || count(*) || ' invalid plants found' END as description
FROM public.ot_platform_users 
WHERE plant IS NOT NULL AND plant NOT IN ('Grand Prairie 097', 'Mulberry 099', 'Romulus 098', 'All Plants')

UNION ALL

SELECT 'platform_users_invalid_plants' as check_type,
       CASE WHEN count(*) = 0 THEN 'PASS - No invalid plants' 
            ELSE 'FAIL - ' || count(*) || ' invalid plants found' END as description
FROM public.platform_users 
WHERE plant IS NOT NULL AND plant NOT IN ('Grand Prairie 097', 'Mulberry 099', 'Romulus 098', 'All Plants')

UNION ALL

SELECT 'managers_invalid_plants' as check_type,
       CASE WHEN count(*) = 0 THEN 'PASS - No invalid plants' 
            ELSE 'FAIL - ' || count(*) || ' invalid plants found' END as description
FROM public.managers 
WHERE plant_code IS NOT NULL AND plant_code NOT IN ('Grand Prairie 097', 'Mulberry 099', 'Romulus 098', 'All Plants')

UNION ALL

SELECT 'orders_invalid_plants' as check_type,
       CASE WHEN count(*) = 0 THEN 'PASS - No invalid plants' 
            ELSE 'FAIL - ' || count(*) || ' invalid plants found' END as description
FROM public.orders 
WHERE plant IS NOT NULL AND plant NOT IN ('Grand Prairie 097', 'Mulberry 099', 'Romulus 098', 'All Plants')

UNION ALL

SELECT 'store_format_validation' as check_type,
       'All stores normalized to 3-digit city format (e.g., Fort Worth 022)' as description

ORDER BY check_type;