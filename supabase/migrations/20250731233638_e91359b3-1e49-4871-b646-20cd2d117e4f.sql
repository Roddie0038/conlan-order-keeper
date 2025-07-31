-- Fix infinite recursion in ot_platform_users RLS policies
-- Drop the problematic policies that cause 500 errors

-- Drop the "Store managers can view relevant users" policy if it exists
DROP POLICY IF EXISTS "Store managers can view relevant users" ON public.ot_platform_users;

-- Drop the "Users can view their own profile" policy if it exists (likely duplicate)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.ot_platform_users;

-- Drop any other potentially problematic policies that might reference the same table
DROP POLICY IF EXISTS "Store managers can access relevant data" ON public.ot_platform_users;
DROP POLICY IF EXISTS "Users can view store users" ON public.ot_platform_users;

-- Ensure we have the basic working policies
-- Keep the existing working policies:
-- - "Authenticated users can search OT platform users" 
-- - "Super admins can view all users"
-- - "Users can view their own OT profile"
-- - Any other non-recursive policies

-- Create a simple, non-recursive policy for store managers if needed
CREATE POLICY "Store managers basic access" ON public.ot_platform_users
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Super admins can see everything
    is_ot_super_admin() OR 
    -- Operations managers can see everything
    is_ot_operations_manager() OR
    -- Users can see their own record
    auth_user_id = auth.uid()
  )
);