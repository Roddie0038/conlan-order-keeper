-- Create recipient action logs table for audit compliance
CREATE TABLE public.recipient_action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL CHECK (action_type IN ('add', 'remove', 'reset')),
  email_type TEXT NOT NULL CHECK (email_type IN ('transfer', 'mto', 'wheel', 'warranty')),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_role TEXT,
  store_number TEXT NOT NULL,
  plant TEXT,
  template_id UUID,
  order_id TEXT,
  performed_by_email TEXT NOT NULL,
  performed_by_name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.recipient_action_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for recipient action logs
CREATE POLICY "Super admins can view all recipient action logs" 
ON public.recipient_action_logs 
FOR SELECT 
USING (is_ot_super_admin() OR is_ot_operations_manager());

CREATE POLICY "Users can view their own recipient action logs" 
ON public.recipient_action_logs 
FOR SELECT 
USING (performed_by_email = auth.email());

CREATE POLICY "Authenticated users can create recipient action logs" 
ON public.recipient_action_logs 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND performed_by_email = auth.email()
);

-- Create indexes for better query performance
CREATE INDEX idx_recipient_action_logs_action_type ON public.recipient_action_logs(action_type);
CREATE INDEX idx_recipient_action_logs_email_type ON public.recipient_action_logs(email_type);
CREATE INDEX idx_recipient_action_logs_store_number ON public.recipient_action_logs(store_number);
CREATE INDEX idx_recipient_action_logs_performed_by ON public.recipient_action_logs(performed_by_email);
CREATE INDEX idx_recipient_action_logs_created_at ON public.recipient_action_logs(created_at);
CREATE INDEX idx_recipient_action_logs_recipient_email ON public.recipient_action_logs(recipient_email);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_recipient_logs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recipient_action_logs_updated_at
BEFORE UPDATE ON public.recipient_action_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_recipient_logs_updated_at_column();