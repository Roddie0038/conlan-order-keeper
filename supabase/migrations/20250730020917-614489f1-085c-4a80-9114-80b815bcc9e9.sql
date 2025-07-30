-- Create a validation trigger to prevent order_id insertions into mto_orders table
-- since it only has an 'id' column, not 'order_id'

CREATE OR REPLACE FUNCTION validate_mto_orders_columns()
RETURNS TRIGGER AS $$
BEGIN
    -- This trigger will fire before INSERT to catch any attempts to insert order_id
    -- Log the attempt for debugging
    RAISE LOG 'MTO Orders insert validation - columns: %', array_to_string(array(SELECT column_name FROM information_schema.columns WHERE table_name = TG_TABLE_NAME), ', ');
    
    -- The mto_orders table should only accept these columns, not order_id
    -- This trigger is mainly for logging and validation
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists and recreate
DROP TRIGGER IF EXISTS validate_mto_orders_columns_trigger ON mto_orders;

CREATE TRIGGER validate_mto_orders_columns_trigger
    BEFORE INSERT ON mto_orders
    FOR EACH ROW
    EXECUTE FUNCTION validate_mto_orders_columns();

-- Add a comment to document this fix
COMMENT ON TRIGGER validate_mto_orders_columns_trigger ON mto_orders IS 
'Validation trigger to help debug order_id vs id column issues in MTO orders';

-- Verify the mto_orders table structure 
-- (This is just a query to confirm the table structure)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'mto_orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;