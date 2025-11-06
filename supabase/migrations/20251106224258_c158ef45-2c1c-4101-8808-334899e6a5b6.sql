-- Add missing fields to app_platforms for webhook receiving
ALTER TABLE public.app_platforms
ADD COLUMN IF NOT EXISTS webhook_secret text,
ADD COLUMN IF NOT EXISTS rate_limit_per_minute integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Add index for platform_key lookups
CREATE INDEX IF NOT EXISTS idx_app_platforms_platform_key ON public.app_platforms(platform_key);

-- Add RLS policies for app_platforms if not exists
ALTER TABLE public.app_platforms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage platforms" ON public.app_platforms;

-- Recreate policy
CREATE POLICY "Admins can manage platforms"
ON public.app_platforms
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

-- Create audit table for platform changes if not exists
CREATE TABLE IF NOT EXISTS public.app_platform_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id uuid REFERENCES public.app_platforms(id),
  user_id uuid,
  user_email text,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.app_platform_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage platform audit"
ON public.app_platform_audit
FOR ALL
USING (is_admin())
WITH CHECK (is_admin());