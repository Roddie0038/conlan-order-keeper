-- Helper function to identify elevated users
CREATE OR REPLACE FUNCTION public.is_elevated_user(user_email text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ot_platform_users 
    WHERE lower(email) = lower(coalesce(user_email,''))
    AND status = 'active'
    AND role IN ('Admin', 'Super Admin', 'Operations Manager')
  ) OR lower(coalesce(user_email,'')) = 'bperry@conlantire.com';
$$;

-- Update RLS policy for orders table to allow elevated users to set different emails
CREATE POLICY "orders_insert_with_elevated_email" ON public.orders
FOR INSERT TO authenticated
WITH CHECK (
  auth.email() IS NOT NULL
  AND (
    lower(email) = lower(auth.email())  -- regular users: must match their own email
    OR public.is_elevated_user(auth.email())  -- elevated: can set different company email
  )
);

-- Update RLS policy for mto_orders table to allow elevated users to set different emails
CREATE POLICY "mto_orders_insert_with_elevated_email" ON public.mto_orders
FOR INSERT TO authenticated
WITH CHECK (
  auth.email() IS NOT NULL
  AND (
    lower(email) = lower(auth.email())  -- regular users: must match their own email
    OR public.is_elevated_user(auth.email())  -- elevated: can set different company email
  )
);

-- Update RLS policy for wheel_orders table to allow elevated users to set different emails
CREATE POLICY "wheel_orders_insert_with_elevated_email" ON public.wheel_orders
FOR INSERT TO authenticated
WITH CHECK (
  auth.email() IS NOT NULL
  AND (
    lower(email) = lower(auth.email())  -- regular users: must match their own email
    OR public.is_elevated_user(auth.email())  -- elevated: can set different company email
  )
);