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
FROM public.ot_platform_users
WHERE status = 'active';