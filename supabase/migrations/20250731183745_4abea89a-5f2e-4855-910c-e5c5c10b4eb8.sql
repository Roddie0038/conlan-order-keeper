-- Enable RLS on mto_orders_backup table to fix security warning
ALTER TABLE public.mto_orders_backup ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy for backup table - only super admins can access
CREATE POLICY "Super admins can view mto_orders backup" 
ON public.mto_orders_backup 
FOR ALL 
USING (is_ot_super_admin() OR is_ot_operations_manager());