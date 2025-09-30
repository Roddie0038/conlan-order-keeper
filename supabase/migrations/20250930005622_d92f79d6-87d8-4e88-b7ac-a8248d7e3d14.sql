-- Fix security for mto_orders_normalize function
CREATE OR REPLACE FUNCTION public.mto_orders_normalize()
RETURNS trigger LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.order_type   := upper(coalesce(NEW.order_type, 'MTO'));
  NEW.store_number := lpad(regexp_replace(coalesce(NEW.store_number, ''), '\D','','g'), 3, '0');
  RETURN NEW;
END $$;