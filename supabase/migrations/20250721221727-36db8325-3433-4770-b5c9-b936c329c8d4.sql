-- Phase 1: Update normalize_store_name function to return "Store XX" format
CREATE OR REPLACE FUNCTION public.normalize_store_name(input_store text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
    store_number text;
    padded_number text;
BEGIN
    -- Handle null or empty input
    IF input_store IS NULL OR input_store = '' THEN
        RETURN input_store;
    END IF;
    
    -- Trim whitespace
    input_store := TRIM(input_store);
    
    -- If already in correct "Store XX" format, return as-is
    IF input_store ~ '^Store \d{2}$' THEN
        RETURN input_store;
    END IF;
    
    -- Extract store number (last sequence of digits)
    store_number := regexp_replace(input_store, '^.*?(\d+).*?$', '\1');
    
    -- If no number found, return original
    IF store_number = input_store OR store_number = '' THEN
        RETURN input_store;
    END IF;
    
    -- Pad to 2 digits and return in "Store XX" format
    padded_number := lpad(store_number, 2, '0');
    
    -- Return standardized format: "Store XX"
    RETURN 'Store ' || padded_number;
END;
$function$;

-- Update existing data in all tables to use the new "Store XX" format
UPDATE orders SET store = normalize_store_name(store) WHERE store IS NOT NULL;
UPDATE mto_orders SET store = normalize_store_name(store) WHERE store IS NOT NULL;
UPDATE wheel_orders SET store = normalize_store_name(store) WHERE store IS NOT NULL;
UPDATE warranty_orders SET store = normalize_store_name(store) WHERE store IS NOT NULL;
UPDATE complaints SET store_number = normalize_store_name(store_number) WHERE store_number IS NOT NULL;

-- Update ordering_email_recipients table to use "Store XX" format
UPDATE ordering_email_recipients SET store_number = lpad(store_number::text, 2, '0') WHERE length(store_number) < 2;

-- Insert missing stores for complete coverage (01-50, 97)
-- This ensures all stores have at least a placeholder entry
DO $$
DECLARE
    store_num text;
    stores_to_add text[] := ARRAY['01','02','03','04','05','06','07','08','09','10',
                                 '11','12','13','14','15','16','17','18','19','20',
                                 '21','22','23','24','25','26','27','28','29','30',
                                 '31','32','33','34','35','36','37','38','39','40',
                                 '41','42','43','44','45','46','47','48','49','50','97'];
BEGIN
    FOREACH store_num IN ARRAY stores_to_add
    LOOP
        -- Only insert if store doesn't exist
        INSERT INTO ordering_email_recipients (store_number, recipient_email, role, email_type, store_name, is_active, created_by)
        SELECT 
            store_num,
            'placeholder@conlantire.com',
            'store_manager',
            'order_confirmation',
            'Store ' || store_num,
            false,  -- inactive until real email is provided
            'system_migration'
        WHERE NOT EXISTS (
            SELECT 1 FROM ordering_email_recipients 
            WHERE store_number = store_num
        );
    END LOOP;
END $$;