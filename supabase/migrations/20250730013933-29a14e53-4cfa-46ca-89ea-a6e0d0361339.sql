-- Fix RLS on ordering_email_recipients_backup table
ALTER TABLE ordering_email_recipients_backup ENABLE ROW LEVEL SECURITY;

-- Add appropriate RLS policy for backup table (super admin/operations manager access only)
CREATE POLICY "Super admins can view ordering_email_recipients backup" ON ordering_email_recipients_backup
FOR ALL USING (is_ot_super_admin() OR is_ot_operations_manager());