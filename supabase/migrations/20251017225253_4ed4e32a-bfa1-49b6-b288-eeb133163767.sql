-- Create ordering_directory table to mirror OT user data
CREATE TABLE IF NOT EXISTS public.ordering_directory (
  user_id uuid PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  role text NOT NULL,
  primary_plant_code text,
  permissions_override jsonb,
  status text NOT NULL,
  can_access_ordering boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS ordering_directory_email_idx ON public.ordering_directory (email);

-- View for app consumption - only active users with ordering access
CREATE OR REPLACE VIEW public.ordering_active_users_v AS
SELECT
  user_id   AS id,
  email,
  full_name,
  role,
  primary_plant_code,
  permissions_override
FROM public.ordering_directory
WHERE status = 'active'
  AND COALESCE(can_access_ordering, false) = true;

-- Enable RLS on ordering_directory
ALTER TABLE public.ordering_directory ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read from ordering_directory
CREATE POLICY "Authenticated users can read ordering directory"
ON public.ordering_directory
FOR SELECT
TO authenticated
USING (true);

-- Only service role can write (via edge function)
CREATE POLICY "Service role can manage ordering directory"
ON public.ordering_directory
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);