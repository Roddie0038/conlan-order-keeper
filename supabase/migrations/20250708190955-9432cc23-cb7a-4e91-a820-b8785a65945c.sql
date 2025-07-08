-- Fix RLS policies for mto_orders to allow authenticated Ordering Platform users to insert

-- Drop the current restrictive policy
DROP POLICY IF EXISTS "OT Role-based mto access" ON mto_orders;

-- Create separate policies for INSERT and SELECT operations
CREATE POLICY "Allow MTO order creation for authenticated users" 
ON mto_orders 
FOR INSERT 
WITH CHECK (
  -- Allow OT Platform users (existing logic)
  (is_ot_super_admin() OR is_ot_operations_manager() OR has_plant_access(plant) OR has_store_access(store))
  OR
  -- Allow Ordering Platform users
  (auth.uid() IS NOT NULL AND (
    EXISTS (SELECT 1 FROM managers WHERE email = auth.email() AND is_active = true)
    OR 
    EXISTS (SELECT 1 FROM platform_users WHERE email = auth.email() AND status = 'active' AND platform = 'ordering_platform')
  ))
);

-- Keep existing viewing logic for OT Platform users only
CREATE POLICY "OT Role-based mto access for viewing" 
ON mto_orders 
FOR SELECT 
USING (is_ot_super_admin() OR is_ot_operations_manager() OR has_plant_access(plant) OR has_store_access(store));

-- Allow OT Platform users to update/delete MTO orders
CREATE POLICY "OT Role-based mto access for updates" 
ON mto_orders 
FOR UPDATE 
USING (is_ot_super_admin() OR is_ot_operations_manager() OR has_plant_access(plant) OR has_store_access(store));

CREATE POLICY "OT Role-based mto access for deletes" 
ON mto_orders 
FOR DELETE 
USING (is_ot_super_admin() OR is_ot_operations_manager());