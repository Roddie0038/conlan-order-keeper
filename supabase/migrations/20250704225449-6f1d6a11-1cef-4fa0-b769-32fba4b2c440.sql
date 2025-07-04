-- Create pending_registrations table for self-service account creation
CREATE TABLE public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  plant_code TEXT NOT NULL,
  store_number TEXT NOT NULL,
  role_title TEXT NOT NULL,
  status TEXT DEFAULT 'pending_verification',
  email_verified BOOLEAN DEFAULT FALSE,
  admin_reviewed BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own registration
CREATE POLICY "Users can create their own registration" 
ON public.pending_registrations 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view pending registrations
CREATE POLICY "Admins can view pending registrations" 
ON public.pending_registrations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM managers 
  WHERE managers.email = (auth.jwt() ->> 'email') 
  AND managers.role IN ('super_admin', 'operations_manager', 'corporate_director') 
  AND managers.is_active = true
));

-- Only admins can update pending registrations
CREATE POLICY "Admins can update pending registrations" 
ON public.pending_registrations 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM managers 
  WHERE managers.email = (auth.jwt() ->> 'email') 
  AND managers.role IN ('super_admin', 'operations_manager', 'corporate_director') 
  AND managers.is_active = true
));

-- Create function to trigger admin notification after email verification
CREATE OR REPLACE FUNCTION public.notify_admin_of_verified_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Only send notification when email_verified changes from false to true
  IF OLD.email_verified = false AND NEW.email_verified = true THEN
    -- This will be handled by an edge function that listens to this table
    NEW.status = 'pending_admin_review';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for admin notification
CREATE TRIGGER trigger_admin_notification
  BEFORE UPDATE ON public.pending_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_of_verified_registration();