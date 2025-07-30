-- 🛠️ MTO ORDER SUBMISSION FIX - Phase 1: Database Cleanup & Restoration
-- This migration fixes the "order_id uuid vs text" error by removing ghost triggers/metadata

-- STEP 1: Create backup of mto_orders table
CREATE TABLE IF NOT EXISTS mto_orders_backup AS
SELECT * FROM public.mto_orders;

-- STEP 2: Drop all problematic triggers that reference non-existent columns
DROP TRIGGER IF EXISTS validate_mto_orders_columns_trigger ON public.mto_orders;
DROP TRIGGER IF EXISTS normalize_mto_orders_store_format ON public.mto_orders;
DROP TRIGGER IF EXISTS normalize_store_before_insert_mto_orders ON public.mto_orders;
DROP TRIGGER IF EXISTS normalize_store_before_update_mto_orders ON public.mto_orders;
DROP TRIGGER IF EXISTS normalize_store_trigger ON public.mto_orders;
DROP TRIGGER IF EXISTS trigger_normalize_store_format_mto ON public.mto_orders;

-- STEP 3: Drop the problematic validation function
DROP FUNCTION IF EXISTS public.validate_mto_orders_columns();

-- STEP 4: Verify table structure is clean (informational - shows current columns)
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'mto_orders' AND table_schema = 'public'
ORDER BY ordinal_position;

-- STEP 5: Ensure proper status constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'mto_orders_status_check'
    ) THEN
        ALTER TABLE public.mto_orders 
        ADD CONSTRAINT mto_orders_status_check 
        CHECK (status IN ('pending', 'open', 'in_progress', 'completed', 'cancelled'));
    END IF;
END $$;

-- STEP 6: Ensure RLS permissions are correct
GRANT ALL ON public.mto_orders TO authenticated;
GRANT ALL ON public.mto_orders TO service_role;

-- STEP 7: Re-create ONLY essential triggers (plant normalization)
CREATE OR REPLACE FUNCTION public.normalize_mto_plant_format()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.plant IS NOT NULL THEN
        NEW.plant := normalize_plant_name(NEW.plant);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS normalize_mto_plant_trigger ON public.mto_orders;
CREATE TRIGGER normalize_mto_plant_trigger
    BEFORE INSERT OR UPDATE ON public.mto_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.normalize_mto_plant_format();

-- STEP 8: Verification query to confirm clean state
SELECT 
    'mto_orders_cleanup_complete' as status,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'open') as open_orders,
    MAX(timestamp::timestamp) as latest_order
FROM public.mto_orders;