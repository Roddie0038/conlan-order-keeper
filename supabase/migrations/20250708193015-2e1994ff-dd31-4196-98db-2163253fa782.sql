-- Fix RLS policy for mto_orders - properly authenticate the current user
-- The previous policy was checking for existence of ANY active users instead of the current user

DROP POLICY IF EXISTS "Allow MTO order creation for authenticated users" ON mto_orders;

CREATE POLICY "Allow MTO order creation for authenticated users" 
ON mto_orders 
FOR INSERT 
WITH CHECK (
  -- Allow OT Platform users (existing logic)
  (is_ot_super_admin() OR is_ot_operations_manager() OR has_plant_access(plant) OR has_store_access(store))
  OR
  -- Allow authenticated users from Ordering Platform - check current user specifically
  (auth.uid() IS NOT NULL AND (
    EXISTS (SELECT 1 FROM managers WHERE email = auth.email() AND is_active = true)
    OR 
    EXISTS (SELECT 1 FROM platform_users WHERE email = auth.email() AND status = 'active' AND platform = 'ordering_platform')
  ))
);