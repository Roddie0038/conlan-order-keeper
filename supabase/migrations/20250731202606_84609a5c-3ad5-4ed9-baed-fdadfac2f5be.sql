-- Add RLS policy for authenticated users to search ot_platform_users
CREATE POLICY "Authenticated users can search OT platform users" 
ON public.ot_platform_users 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND status = 'active'
);