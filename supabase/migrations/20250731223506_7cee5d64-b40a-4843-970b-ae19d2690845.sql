-- Enable RLS on the ot_platform_users_searchable view
ALTER VIEW public.ot_platform_users_searchable SET (security_barrier = true);
ALTER VIEW public.ot_platform_users_searchable ENABLE ROW LEVEL SECURITY;

-- Create policy for Super Admins to see all users
CREATE POLICY "Super admins can view all searchable users"
ON public.ot_platform_users_searchable
FOR SELECT
USING (is_ot_super_admin() OR is_ot_operations_manager());

-- Create policy for Store Managers to see users from their store and plant
CREATE POLICY "Store managers can view relevant users"
ON public.ot_platform_users_searchable
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.ot_platform_users current_user
    WHERE current_user.auth_user_id = auth.uid()
    AND current_user.status = 'active'
    AND (
      -- Store managers can see users from their own store
      (current_user.role = 'store_manager' AND 
       normalize_store_format(current_user.store) = normalize_store_format(ot_platform_users_searchable.store))
      OR
      -- Plant staff can see users from their own plant
      (current_user.role IN ('warehouse_manager', 'warehouse_coordinator', 'retread_manager', 'plant_manager', 'office_manager', 'warehouse_staff', 'service_manager', 'plant_admin') AND
       normalize_plant_name(current_user.plant) = normalize_plant_name(ot_platform_users_searchable.plant))
      OR
      -- Operations managers can see all users
      (current_user.role = 'operations_manager')
    )
  )
);

-- Create policy for authenticated users to see their own profile
CREATE POLICY "Users can view their own searchable profile"
ON public.ot_platform_users_searchable
FOR SELECT
USING (auth.email() = email);