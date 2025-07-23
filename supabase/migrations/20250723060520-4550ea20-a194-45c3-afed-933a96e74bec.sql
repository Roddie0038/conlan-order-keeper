-- Fix the normalize_store_format function to handle "22" correctly
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
    
    -- Handle Store 22 variants specifically (including plain "22")
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

-- Re-run the data updates to catch anything missed
UPDATE orders SET store = normalize_store_format(store) WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');
UPDATE ot_platform_users SET store = normalize_store_format(store) WHERE store IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');
UPDATE ordering_email_recipients SET store_number = normalize_store_format(store_number) WHERE store_number IN ('22', '022', 'Store 22', 'Fort Worth 22', 'Forth Worth 22');