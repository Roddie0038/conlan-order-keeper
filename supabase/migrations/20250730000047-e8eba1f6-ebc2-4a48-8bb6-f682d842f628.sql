-- IMMEDIATE SECURITY FIX: Enable RLS on backup tables
-- The backup tables created during migration need RLS enabled

ALTER TABLE notification_logs_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordering_email_logs_backup ENABLE ROW LEVEL SECURITY;

-- Add appropriate RLS policies for backup tables (super admin access only)
CREATE POLICY "Super admins can view notification_logs backup" ON notification_logs_backup
FOR ALL USING (is_ot_super_admin() OR is_ot_operations_manager());

CREATE POLICY "Super admins can view notification_queue backup" ON notification_queue_backup
FOR ALL USING (is_ot_super_admin() OR is_ot_operations_manager());

CREATE POLICY "Super admins can view ordering_email_logs backup" ON ordering_email_logs_backup
FOR ALL USING (is_ot_super_admin() OR is_ot_operations_manager());