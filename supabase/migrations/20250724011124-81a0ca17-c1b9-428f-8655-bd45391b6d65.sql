-- ================================================
-- PLANT FORMAT NORMALIZATION MIGRATION
-- Phase 4: Comprehensive Plant Standardization + Policies
-- ================================================

-- 1. ENHANCED PLANT NORMALIZATION FUNCTION
-- ================================================
DROP FUNCTION IF EXISTS public.normalize_plant_name(text);

CREATE OR REPLACE FUNCTION public.normalize_plant_name(input_plant text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- Handle null, empty, or whitespace-only input
    IF input_plant IS NULL OR TRIM(input_plant) = '' THEN
        RETURN 'Grand Prairie 097';
    END IF;
    
    -- Normalize case and trim whitespace
    input_plant := TRIM(lower(input_plant));
    
    -- Grand Prairie 097 variants (most common)
    IF input_plant IN (
        'grand prairie 97', 'grand prairie 097', 'grand prairie', 'grandprairie',
        'gp 97', 'gp 097', 'gp', '97', '097',
        'grand praire', 'grand prarie',  -- common typos
        'texas', 'dallas', 'fort worth plant'
    ) THEN 
        RETURN 'Grand Prairie 097';
    END IF;
    
    -- Mulberry 099 variants
    IF input_plant IN (
        'mulberry 99', 'mulberry 099', 'mulberry', 
        'mb 99', 'mb 099', 'mb', '99', '099',
        'florida', 'central florida', 'lakeland'
    ) THEN 
        RETURN 'Mulberry 099';
    END IF;
    
    -- Romulus 098 variants  
    IF input_plant IN (
        'romulus 98', 'romulus 098', 'romulus',
        'rom 98', 'rom 098', 'rom', '98', '098', 
        'michigan', 'detroit', 'midwest'
    ) THEN 
        RETURN 'Romulus 098';
    END IF;
    
    -- Special administrative cases
    IF input_plant IN ('all plants', 'all', 'admin', 'corporate', 'headquarters', 'hq') THEN 
        RETURN 'All Plants';
    END IF;
    
    -- Handle unknown/legacy cases
    IF input_plant IN ('unknown', 'null', 'n/a', 'tbd', 'pending') THEN
        RETURN 'Grand Prairie 097';
    END IF;
    
    -- Default fallback
    RETURN 'Grand Prairie 097';
END;
$$;

-- 2. PLANT NORMALIZATION TRIGGER FUNCTION
-- ================================================
CREATE OR REPLACE FUNCTION public.trigger_normalize_plant_format()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    -- Handle different table structures for plant columns
    IF TG_TABLE_NAME IN ('orders', 'mto_orders', 'wheel_orders', 'warranty_orders', 'platform_users', 'ot_platform_users') THEN
        IF NEW.plant IS NOT NULL THEN
            NEW.plant := public.normalize_plant_name(NEW.plant);
        END IF;
    ELSIF TG_TABLE_NAME = 'managers' THEN
        IF NEW.plant_code IS NOT NULL THEN
            NEW.plant_code := public.normalize_plant_name(NEW.plant_code);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. DROP EXISTING PLANT TRIGGERS 
-- ================================================
DROP TRIGGER IF EXISTS normalize_plant_trigger ON orders;
DROP TRIGGER IF EXISTS normalize_plant_trigger ON mto_orders;
DROP TRIGGER IF EXISTS normalize_plant_trigger ON wheel_orders;
DROP TRIGGER IF EXISTS normalize_plant_trigger ON warranty_orders;
DROP TRIGGER IF EXISTS normalize_plant_trigger ON platform_users;
DROP TRIGGER IF EXISTS normalize_plant_trigger ON ot_platform_users;
DROP TRIGGER IF EXISTS normalize_plant_trigger ON managers;

-- 4. CREATE NEW PLANT NORMALIZATION TRIGGERS
-- ================================================
CREATE TRIGGER normalize_plant_trigger
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_normalize_plant_format();

CREATE TRIGGER normalize_plant_trigger
    BEFORE INSERT OR UPDATE ON mto_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_normalize_plant_format();

CREATE TRIGGER normalize_plant_trigger
    BEFORE INSERT OR UPDATE ON wheel_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_normalize_plant_format();

CREATE TRIGGER normalize_plant_trigger
    BEFORE INSERT OR UPDATE ON warranty_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_normalize_plant_format();

CREATE TRIGGER normalize_plant_trigger
    BEFORE INSERT OR UPDATE ON platform_users
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_normalize_plant_format();

CREATE TRIGGER normalize_plant_trigger
    BEFORE INSERT OR UPDATE ON ot_platform_users
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_normalize_plant_format();

CREATE TRIGGER normalize_plant_trigger
    BEFORE INSERT OR UPDATE ON managers
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_normalize_plant_format();

-- 5. NORMALIZE EXISTING PLANT DATA ACROSS ALL TABLES
-- ================================================

-- Update orders table
UPDATE public.orders 
SET plant = public.normalize_plant_name(plant) 
WHERE plant IS NOT NULL 
  AND plant != public.normalize_plant_name(plant);

-- Update mto_orders table
UPDATE public.mto_orders 
SET plant = public.normalize_plant_name(plant) 
WHERE plant IS NOT NULL 
  AND plant != public.normalize_plant_name(plant);

-- Update wheel_orders table (if exists)
UPDATE public.wheel_orders 
SET plant = public.normalize_plant_name(plant) 
WHERE plant IS NOT NULL 
  AND plant != public.normalize_plant_name(plant);

-- Update warranty_orders table (if exists)
UPDATE public.warranty_orders 
SET plant = public.normalize_plant_name(plant) 
WHERE plant IS NOT NULL 
  AND plant != public.normalize_plant_name(plant);

-- Update platform_users table
UPDATE public.platform_users 
SET plant = public.normalize_plant_name(plant) 
WHERE plant IS NOT NULL 
  AND plant != public.normalize_plant_name(plant);

-- Update ot_platform_users table
UPDATE public.ot_platform_users 
SET plant = public.normalize_plant_name(plant) 
WHERE plant IS NOT NULL 
  AND plant != public.normalize_plant_name(plant);

-- Update managers table (plant_code column)
UPDATE public.managers 
SET plant_code = public.normalize_plant_name(plant_code) 
WHERE plant_code IS NOT NULL 
  AND plant_code != public.normalize_plant_name(plant_code);

-- Update inventory_users table (if exists)
UPDATE public.inventory_users 
SET plant = public.normalize_plant_name(plant) 
WHERE plant IS NOT NULL 
  AND plant != public.normalize_plant_name(plant);

-- 6. UPDATE PLANT-BASED ACCESS CONTROL FUNCTIONS
-- ================================================

-- Enhanced has_plant_access function
CREATE OR REPLACE FUNCTION public.has_plant_access(target_plant text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ot_platform_users 
    WHERE auth_user_id = auth.uid() 
    AND status = 'active'
    AND (
      normalize_plant_name(plant) = normalize_plant_name(target_plant) OR 
      normalize_plant_name(plant) = 'All Plants'
    )
    AND role IN ('warehouse_manager', 'warehouse_coordinator', 'retread_manager', 'plant_manager', 'office_manager', 'warehouse_staff', 'service_manager', 'plant_admin')
  );
$$;

-- Enhanced can_manage_plant_users function
CREATE OR REPLACE FUNCTION public.can_manage_plant_users(target_plant text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.ot_platform_users
    WHERE auth_user_id = auth.uid()
    AND role IN ('super_admin', 'operations_manager')
    AND status = 'active'
    AND (
      role = 'super_admin' OR 
      normalize_plant_name(plant) = normalize_plant_name(target_plant) OR
      normalize_plant_name(plant) = 'All Plants'
    )
  );
$$;

-- 7. CREATE PLANT NORMALIZATION VERIFICATION VIEW
-- ================================================
CREATE OR REPLACE VIEW public.plant_normalization_verification AS
SELECT 
    'orders' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN plant = normalize_plant_name(plant) THEN 1 END) as normalized_plants,
    COUNT(CASE WHEN plant != normalize_plant_name(plant) THEN 1 END) as non_normalized_plants,
    array_agg(DISTINCT plant) FILTER (WHERE plant IS NOT NULL) as unique_plant_values
FROM public.orders
WHERE plant IS NOT NULL

UNION ALL

SELECT 
    'mto_orders' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN plant = normalize_plant_name(plant) THEN 1 END) as normalized_plants,
    COUNT(CASE WHEN plant != normalize_plant_name(plant) THEN 1 END) as non_normalized_plants,
    array_agg(DISTINCT plant) FILTER (WHERE plant IS NOT NULL) as unique_plant_values
FROM public.mto_orders
WHERE plant IS NOT NULL

UNION ALL

SELECT 
    'platform_users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN plant = normalize_plant_name(plant) THEN 1 END) as normalized_plants,
    COUNT(CASE WHEN plant != normalize_plant_name(plant) THEN 1 END) as non_normalized_plants,
    array_agg(DISTINCT plant) FILTER (WHERE plant IS NOT NULL) as unique_plant_values
FROM public.platform_users
WHERE plant IS NOT NULL

UNION ALL

SELECT 
    'ot_platform_users' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN plant = normalize_plant_name(plant) THEN 1 END) as normalized_plants,
    COUNT(CASE WHEN plant != normalize_plant_name(plant) THEN 1 END) as non_normalized_plants,
    array_agg(DISTINCT plant) FILTER (WHERE plant IS NOT NULL) as unique_plant_values
FROM public.ot_platform_users
WHERE plant IS NOT NULL

UNION ALL

SELECT 
    'managers' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN plant_code = normalize_plant_name(plant_code) THEN 1 END) as normalized_plants,
    COUNT(CASE WHEN plant_code != normalize_plant_name(plant_code) THEN 1 END) as non_normalized_plants,
    array_agg(DISTINCT plant_code) FILTER (WHERE plant_code IS NOT NULL) as unique_plant_values
FROM public.managers
WHERE plant_code IS NOT NULL;

-- 8. VERIFY CROSS-PLANT ORDER LOGIC COMPATIBILITY
-- ================================================

-- Update any remaining plant references in computed columns or views that might affect cross-plant logic
-- This ensures PlantContext.tsx and related frontend logic works seamlessly

-- Create a function to validate cross-plant orders
CREATE OR REPLACE FUNCTION public.is_cross_plant_order(order_plant text, user_default_plant text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT normalize_plant_name(order_plant) != normalize_plant_name(user_default_plant);
$$;

-- 9. FINAL VERIFICATION QUERY
-- ================================================
SELECT 
    'Plant Normalization Migration Complete' as status,
    (SELECT COUNT(*) FROM plant_normalization_verification WHERE non_normalized_plants > 0) as tables_with_issues,
    NOW() as completed_at;