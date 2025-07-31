-- Apply RLS policies to the base ot_platform_users table instead of the view
-- (Views cannot have RLS enabled, but tables can)

-- Create policy for Super Admins to see all users
CREATE POLICY "Super admins can view all users" 
ON public.ot_platform_users
FOR SELECT
USING (is_ot_super_admin() OR is_ot_operations_manager());

-- Create policy for Store Managers to see users from their store and plant
CREATE POLICY "Store managers can view relevant users"
ON public.ot_platform_users  
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ot_platform_users u
    WHERE u.auth_user_id = auth.uid()
    AND u.status = 'active'
    AND (
      -- Store managers can see users from their own store
      (u.role = 'store_manager' AND 
       normalize_store_format(u.store) = normalize_store_format(ot_platform_users.store))
      OR
      -- Plant staff can see users from their own plant  
      (u.role IN ('warehouse_manager', 'warehouse_coordinator', 'retread_manager', 'plant_manager', 'office_manager', 'warehouse_staff', 'service_manager', 'plant_admin') AND
       normalize_plant_name(u.plant) = normalize_plant_name(ot_platform_users.plant))
      OR
      -- Operations managers can see all users
      (u.role = 'operations_manager')
    )
  )
);

-- Create policy for authenticated users to see their own profile
CREATE POLICY "Users can view their own profile"
ON public.ot_platform_users
FOR SELECT  
USING (auth.email() = email);