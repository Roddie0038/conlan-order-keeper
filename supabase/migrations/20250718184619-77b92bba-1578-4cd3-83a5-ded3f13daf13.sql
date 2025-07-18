-- Create normalize_store_name function for consistent store formatting
CREATE OR REPLACE FUNCTION public.normalize_store_name(input_store text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
    store_number text;
    store_name text;
    padded_number text;
BEGIN
    -- Handle null or empty input
    IF input_store IS NULL OR input_store = '' THEN
        RETURN input_store;
    END IF;
    
    -- Trim whitespace
    input_store := TRIM(input_store);
    
    -- If already in correct format (Name ###), return as-is
    IF input_store ~ '^[A-Za-z\s]+ \d{3}$' THEN
        RETURN input_store;
    END IF;
    
    -- Extract store number (last sequence of digits)
    store_number := regexp_replace(input_store, '^.*?(\d+).*?$', '\1');
    
    -- If no number found, return original
    IF store_number = input_store OR store_number = '' THEN
        RETURN input_store;
    END IF;
    
    -- Pad to 3 digits
    padded_number := lpad(store_number, 3, '0');
    
    -- Map store numbers to names and return formatted string
    CASE store_number::integer
        WHEN 1 THEN RETURN 'Fort Myers ' || padded_number;
        WHEN 2 THEN RETURN 'Tampa ' || padded_number;
        WHEN 3 THEN RETURN 'St. Petersburg ' || padded_number;
        WHEN 4 THEN RETURN 'Clearwater ' || padded_number;
        WHEN 5 THEN RETURN 'Lakeland ' || padded_number;
        WHEN 6 THEN RETURN 'Sarasota ' || padded_number;
        WHEN 7 THEN RETURN 'Gainesville ' || padded_number;
        WHEN 8 THEN RETURN 'Ocala ' || padded_number;
        WHEN 9 THEN RETURN 'The Villages ' || padded_number;
        WHEN 10 THEN RETURN 'Leesburg ' || padded_number;
        WHEN 11 THEN RETURN 'Orlando ' || padded_number;
        WHEN 12 THEN RETURN 'Kissimmee ' || padded_number;
        WHEN 13 THEN RETURN 'Melbourne ' || padded_number;
        WHEN 14 THEN RETURN 'Vero Beach ' || padded_number;
        WHEN 15 THEN RETURN 'West Palm Beach ' || padded_number;
        WHEN 16 THEN RETURN 'Fort Lauderdale ' || padded_number;
        WHEN 17 THEN RETURN 'Miami ' || padded_number;
        WHEN 18 THEN RETURN 'Homestead ' || padded_number;
        WHEN 19 THEN RETURN 'Key West ' || padded_number;
        WHEN 20 THEN RETURN 'Naples ' || padded_number;
        WHEN 21 THEN RETURN 'Jacksonville ' || padded_number;
        WHEN 22 THEN RETURN 'Fort Worth ' || padded_number;
        WHEN 23 THEN RETURN 'Arlington ' || padded_number;
        WHEN 24 THEN RETURN 'Dallas ' || padded_number;
        WHEN 25 THEN RETURN 'Plano ' || padded_number;
        WHEN 26 THEN RETURN 'Garland ' || padded_number;
        WHEN 27 THEN RETURN 'Grand Prairie ' || padded_number;
        WHEN 28 THEN RETURN 'Irving ' || padded_number;
        WHEN 29 THEN RETURN 'Mesquite ' || padded_number;
        WHEN 30 THEN RETURN 'Carrollton ' || padded_number;
        WHEN 31 THEN RETURN 'Richardson ' || padded_number;
        WHEN 32 THEN RETURN 'Lewisville ' || padded_number;
        WHEN 33 THEN RETURN 'Flower Mound ' || padded_number;
        WHEN 34 THEN RETURN 'Euless ' || padded_number;
        WHEN 35 THEN RETURN 'Bedford ' || padded_number;
        WHEN 36 THEN RETURN 'Tulsa ' || padded_number;
        WHEN 37 THEN RETURN 'Oklahoma City ' || padded_number;
        WHEN 38 THEN RETURN 'Norman ' || padded_number;
        WHEN 39 THEN RETURN 'Edmond ' || padded_number;
        WHEN 40 THEN RETURN 'Broken Arrow ' || padded_number;
        WHEN 41 THEN RETURN 'Lawton ' || padded_number;
        WHEN 42 THEN RETURN 'Moore ' || padded_number;
        WHEN 43 THEN RETURN 'Midwest City ' || padded_number;
        WHEN 44 THEN RETURN 'Enid ' || padded_number;
        WHEN 45 THEN RETURN 'Stillwater ' || padded_number;
        ELSE 
            -- For unmapped stores, try to extract name from existing format
            IF input_store ~ '^[A-Za-z\s]+ \d+$' THEN
                store_name := regexp_replace(input_store, '^([A-Za-z\s]+) \d+$', '\1');
                RETURN TRIM(store_name) || ' ' || padded_number;
            ELSE
                RETURN input_store; -- Return original if format not recognized
            END IF;
    END CASE;
END;
$function$;

-- Update existing records in orders table
UPDATE orders 
SET store = normalize_store_name(store) 
WHERE store IS NOT NULL 
AND store != normalize_store_name(store);

-- Update existing records in mto_orders table
UPDATE mto_orders 
SET store = normalize_store_name(store) 
WHERE store IS NOT NULL 
AND store != normalize_store_name(store);

-- Update existing records in wheel_orders table
UPDATE wheel_orders 
SET store = normalize_store_name(store) 
WHERE store IS NOT NULL 
AND store != normalize_store_name(store);

-- Update existing records in complaints table
UPDATE complaints 
SET store_number = normalize_store_name(store_number) 
WHERE store_number IS NOT NULL 
AND store_number != normalize_store_name(store_number);

-- Create trigger function for automatic store normalization
CREATE OR REPLACE FUNCTION public.trigger_normalize_store()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Normalize store field if it exists
    IF TG_TABLE_NAME = 'orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_name(NEW.store);
    ELSIF TG_TABLE_NAME = 'mto_orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_name(NEW.store);
    ELSIF TG_TABLE_NAME = 'wheel_orders' AND NEW.store IS NOT NULL THEN
        NEW.store := normalize_store_name(NEW.store);
    ELSIF TG_TABLE_NAME = 'complaints' AND NEW.store_number IS NOT NULL THEN
        NEW.store_number := normalize_store_name(NEW.store_number);
    END IF;
    
    RETURN NEW;
END;
$function$;

-- Create triggers for automatic store normalization on insert/update
DROP TRIGGER IF EXISTS normalize_store_trigger ON orders;
CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store();

DROP TRIGGER IF EXISTS normalize_store_trigger ON mto_orders;
CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON mto_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store();

DROP TRIGGER IF EXISTS normalize_store_trigger ON wheel_orders;
CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON wheel_orders
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store();

DROP TRIGGER IF EXISTS normalize_store_trigger ON complaints;
CREATE TRIGGER normalize_store_trigger
    BEFORE INSERT OR UPDATE ON complaints
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store();