-- Emergency fix for MTO order submission error
-- Step 1: Backup the mto_orders table
CREATE TABLE IF NOT EXISTS mto_orders_backup AS
SELECT * FROM public.mto_orders;

-- Step 2: Drop problematic email notification triggers causing UUID/text type mismatch
DROP TRIGGER IF EXISTS mto_email_notification_trigger_v3 ON public.mto_orders;
DROP TRIGGER IF EXISTS trigger_mto_email_after_insert ON public.mto_orders;