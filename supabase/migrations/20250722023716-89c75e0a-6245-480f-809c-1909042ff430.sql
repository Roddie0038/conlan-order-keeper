
-- Create RLS policies for mto_orders table to match other order tables

-- Policy for INSERT operations - allow authenticated OT users to create MTO orders
CREATE POLICY "OT Role-based MTO order insert" 
ON mto_orders 
FOR INSERT 
WITH CHECK (
  is_ot_super_admin() OR 
  is_ot_operations_manager() OR 
  has_plant_access(plant) OR 
  has_store_access(store)
);

-- Policy for SELECT operations - allow users to view MTO orders they have access to
CREATE POLICY "OT Role-based MTO order access" 
ON mto_orders 
FOR SELECT 
USING (
  is_ot_super_admin() OR 
  is_ot_operations_manager() OR 
  has_plant_access(plant) OR 
  has_store_access(store)
);

-- Policy for UPDATE operations - allow authorized users to update MTO orders
CREATE POLICY "OT Role-based MTO order update" 
ON mto_orders 
FOR UPDATE 
USING (
  is_ot_super_admin() OR 
  is_ot_operations_manager() OR 
  has_plant_access(plant) OR 
  has_store_access(store)
);

-- Policy for DELETE operations - restrict to super admins and operations managers
CREATE POLICY "OT Role-based MTO order delete" 
ON mto_orders 
FOR DELETE 
USING (
  is_ot_super_admin() OR 
  is_ot_operations_manager()
);

-- Add policy for realtime subscriptions (matching orders table pattern)
CREATE POLICY "Allow read for realtime subscriptions" 
ON mto_orders 
FOR SELECT 
USING (true);
