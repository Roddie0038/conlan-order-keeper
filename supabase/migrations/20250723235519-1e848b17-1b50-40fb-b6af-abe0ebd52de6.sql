-- FINAL PLANT AND STORE NORMALIZATION - CASCADE CLEANUP
-- Step 1: Remove all existing triggers and functions with CASCADE

-- Drop the function and all dependent triggers
DROP FUNCTION IF EXISTS public.validate_plant_name() CASCADE;
DROP FUNCTION IF EXISTS public.validate_plant_and_store_format() CASCADE;

-- Also drop any remaining individual triggers
DROP TRIGGER IF EXISTS validate_plant_name_ot_users ON ot_platform_users;
DROP TRIGGER IF EXISTS validate_plant_name_platform_users ON platform_users;
DROP TRIGGER IF EXISTS validate_plant_name_orders ON orders;
DROP TRIGGER IF EXISTS validate_plant_name_managers ON managers;

-- Step 2: Fix Legacy Store Values to 3-digit city format
UPDATE orders SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2', '22');
UPDATE orders SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE orders SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE orders SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE orders SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE orders SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE orders SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE orders SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE orders SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE orders SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

UPDATE mto_orders SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2', '22');
UPDATE mto_orders SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE mto_orders SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE mto_orders SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE mto_orders SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE mto_orders SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE mto_orders SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE mto_orders SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE mto_orders SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE mto_orders SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

UPDATE wheel_orders SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2', '22');
UPDATE wheel_orders SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE wheel_orders SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE wheel_orders SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE wheel_orders SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE wheel_orders SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE wheel_orders SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE wheel_orders SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE wheel_orders SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE wheel_orders SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

UPDATE warranty_orders SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2', '22');
UPDATE warranty_orders SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE warranty_orders SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE warranty_orders SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE warranty_orders SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE warranty_orders SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE warranty_orders SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE warranty_orders SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE warranty_orders SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE warranty_orders SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

UPDATE platform_users SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2', '22');
UPDATE platform_users SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE platform_users SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE platform_users SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE platform_users SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE platform_users SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE platform_users SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE platform_users SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE platform_users SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE platform_users SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

UPDATE ot_platform_users SET store = 'Fort Worth 022' WHERE store IN ('Store 02', '02', 'Store 2', '22');
UPDATE ot_platform_users SET store = 'Grand Prairie 027' WHERE store IN ('Store 27', '27');
UPDATE ot_platform_users SET store = 'Houston 028' WHERE store IN ('Store 28', '28');
UPDATE ot_platform_users SET store = 'San Antonio 029' WHERE store IN ('Store 29', '29');
UPDATE ot_platform_users SET store = 'Oklahoma City 030' WHERE store IN ('Store 30', '30');
UPDATE ot_platform_users SET store = 'Little Rock 032' WHERE store IN ('Store 32', '32');
UPDATE ot_platform_users SET store = 'Kansas City 033' WHERE store IN ('Store 33', '33');
UPDATE ot_platform_users SET store = 'Laredo 035' WHERE store IN ('Store 35', '35');
UPDATE ot_platform_users SET store = 'Tulsa 036' WHERE store IN ('Store 36', '36');
UPDATE ot_platform_users SET store = 'Austin 039' WHERE store IN ('Store 39', '39');

UPDATE managers SET store_number = 'Fort Worth 022' WHERE store_number IN ('Store 02', '02', 'Store 2', '22');
UPDATE managers SET store_number = 'Grand Prairie 027' WHERE store_number IN ('Store 27', '27');
UPDATE managers SET store_number = 'Houston 028' WHERE store_number IN ('Store 28', '28');
UPDATE managers SET store_number = 'San Antonio 029' WHERE store_number IN ('Store 29', '29');
UPDATE managers SET store_number = 'Oklahoma City 030' WHERE store_number IN ('Store 30', '30');
UPDATE managers SET store_number = 'Little Rock 032' WHERE store_number IN ('Store 32', '32');
UPDATE managers SET store_number = 'Kansas City 033' WHERE store_number IN ('Store 33', '33');
UPDATE managers SET store_number = 'Laredo 035' WHERE store_number IN ('Store 35', '35');
UPDATE managers SET store_number = 'Tulsa 036' WHERE store_number IN ('Store 36', '36');
UPDATE managers SET store_number = 'Austin 039' WHERE store_number IN ('Store 39', '39');

-- Step 3: Fix Legacy Plant Values to 3-digit format
UPDATE managers SET plant_code = 'Romulus 098' WHERE plant_code = '98';
UPDATE orders SET plant = 'Grand Prairie 097' WHERE plant = 'Grand Prairie 97';
UPDATE platform_users SET plant = 'Grand Prairie 097' WHERE plant IN ('Admin', 'Unknown');
UPDATE orders SET store = 'Fort Worth 022', plant = 'Grand Prairie 097' WHERE store = 'Store 00';

-- Step 4: Enhanced Plant Normalization Function
CREATE OR REPLACE FUNCTION public.normalize_plant_name(input_plant text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
BEGIN
    IF input_plant IS NULL OR input_plant = '' THEN
        RETURN 'Grand Prairie 097';
    END IF;
    
    input_plant := TRIM(lower(input_plant));
    
    IF input_plant IN ('grand prairie 97', 'grand prairie 097', 'grand prairie', 'gp 97', 'gp 097', '97', '097') THEN 
        RETURN 'Grand Prairie 097';
    END IF;
    
    IF input_plant IN ('mulberry 99', 'mulberry 099', 'mulberry', 'mb 99', 'mb 099', '99', '099') THEN 
        RETURN 'Mulberry 099';
    END IF;
    
    IF input_plant IN ('romulus 98', 'romulus 098', 'romulus', 'rom 98', 'rom 098', '98', '098') THEN 
        RETURN 'Romulus 098';
    END IF;
    
    IF input_plant IN ('all plants', 'all', 'admin') THEN 
        RETURN 'All Plants';
    END IF;
    
    IF input_plant IN ('unknown', '', 'null') THEN
        RETURN 'Grand Prairie 097';
    END IF;
    
    RETURN 'Grand Prairie 097';
END;
$function$;

-- Step 5: Apply normalization to existing data
UPDATE orders SET plant = normalize_plant_name(plant) WHERE plant IS NOT NULL;
UPDATE platform_users SET plant = normalize_plant_name(plant) WHERE plant IS NOT NULL;
UPDATE managers SET plant_code = normalize_plant_name(plant_code) WHERE plant_code IS NOT NULL;
UPDATE ot_platform_users SET plant = normalize_plant_name(plant) WHERE plant IS NOT NULL;

-- Step 6: Apply store normalization using existing function
UPDATE orders SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE mto_orders SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE wheel_orders SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE warranty_orders SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE platform_users SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE ot_platform_users SET store = normalize_store_format(store) WHERE store IS NOT NULL;
UPDATE managers SET store_number = normalize_store_format(store_number) WHERE store_number IS NOT NULL;