-- Create a searchable view for ot_platform_users with role cast to text
CREATE OR REPLACE VIEW public.ot_platform_users_searchable AS
SELECT 
  id,
  auth_user_id,
  email,
  full_name,
  role,
  role::text AS role_text,
  plant,
  store,
  status,
  created_at,
  updated_at,
  last_login,
  is_super_admin,
  temporary_password_set_at,
  temporary_password_expires_at,
  must_change_password,
  created_by,
  updated_by
FROM public.ot_platform_users;

-- Add RLS policy for the searchable view
CREATE POLICY "Authenticated users can search OT platform users via searchable view" 
ON public.ot_platform_users_searchable 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND status = 'active'
);