-- Fix RLS policies for Super Admin access to user management tables

-- Update user_activity_logs RLS policies
DROP POLICY IF EXISTS "Super admin can view all activity logs" ON user_activity_logs;
DROP POLICY IF EXISTS "Super admin can create activity logs" ON user_activity_logs;

CREATE POLICY "Super admin can view all activity logs" 
ON user_activity_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'roderickdemarais@aol.com'
  )
);

CREATE POLICY "Super admin can create activity logs" 
ON user_activity_logs 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'roderickdemarais@aol.com'
  )
);

-- Update platform_users RLS policies  
DROP POLICY IF EXISTS "Super admin can manage all platform users" ON platform_users;

CREATE POLICY "Super admin can manage all platform users" 
ON platform_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'roderickdemarais@aol.com'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND users.email = 'roderickdemarais@aol.com'
  )
);