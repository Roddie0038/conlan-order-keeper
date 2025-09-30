-- 1. Ensure columns exist (no-op if present)
ALTER TABLE public.mto_orders
  ADD COLUMN IF NOT EXISTS submitted_by_name text,
  ADD COLUMN IF NOT EXISTS submitted_by_email text;

-- 2. Normalize before insert/update
CREATE OR REPLACE FUNCTION public.mto_orders_normalize()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.order_type   := upper(coalesce(NEW.order_type, 'MTO'));
  NEW.store_number := lpad(regexp_replace(coalesce(NEW.store_number, ''), '\D','','g'), 3, '0');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_mto_orders_normalize ON public.mto_orders;
CREATE TRIGGER trg_mto_orders_normalize
BEFORE INSERT OR UPDATE ON public.mto_orders
FOR EACH ROW EXECUTE FUNCTION public.mto_orders_normalize();

-- 3. Create optional view that maps open → 'pending' for UI without touching DB constraints
CREATE OR REPLACE VIEW ot_dashboard_mto_orders AS
SELECT
  o.*,
  CASE WHEN o.status = 'open' THEN 'pending' ELSE o.status END AS ui_status
FROM public.mto_orders o
WHERE o.order_type = 'MTO';

-- 4. Ensure API roles have access (adjust roles as needed)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.mto_orders TO anon, authenticated;

-- 5. Refresh PostgREST cache
NOTIFY pgrst, 'reload schema';