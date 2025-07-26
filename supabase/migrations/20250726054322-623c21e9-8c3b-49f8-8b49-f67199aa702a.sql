-- Fix MTO orders RLS policy to allow proper authenticated user access
-- Drop existing restrictive policy and create new one that allows store/plant access

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "OT Role-based MTO order insert" ON public.mto_orders;

-- Create new policy that allows authenticated users to insert MTO orders
-- if they have store access OR plant access OR are super admin/operations manager
CREATE POLICY "Allow MTO order insert for authenticated users" 
ON public.mto_orders 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    is_ot_super_admin() OR 
    is_ot_operations_manager() OR 
    has_plant_access(plant) OR 
    has_store_access(store) OR
    -- Temporary fallback: allow if user exists in ot_platform_users
    EXISTS (
      SELECT 1 FROM public.ot_platform_users 
      WHERE auth_user_id = auth.uid() 
      AND status = 'active'
    )
  )
);