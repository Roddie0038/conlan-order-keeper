-- Create ordering_email_recipients table for Super Admin email routing management
CREATE TABLE public.ordering_email_recipients (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  store_number text NOT NULL,
  store_name text,
  recipient_email text NOT NULL,
  role text DEFAULT 'store_manager',
  email_type text DEFAULT 'order_confirmation',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  created_by text
);

-- Create ordering_email_logs table for delivery tracking
CREATE TABLE public.ordering_email_logs (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  store_number text,
  recipient_email text,
  email_type text,
  order_type text,
  order_id text,
  status text, -- success, failed
  response text,
  error_details text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ordering_email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordering_email_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - Super Admin only access
CREATE POLICY "Super admin only - ordering email recipients" 
ON public.ordering_email_recipients
FOR ALL 
USING (auth.email() = 'roderickdemarais@aol.com')
WITH CHECK (auth.email() = 'roderickdemarais@aol.com');

CREATE POLICY "Super admin only - ordering email logs" 
ON public.ordering_email_logs
FOR ALL 
USING (auth.email() = 'roderickdemarais@aol.com')
WITH CHECK (auth.email() = 'roderickdemarais@aol.com');

-- Insert some initial test data
INSERT INTO public.ordering_email_recipients (store_number, store_name, recipient_email, role, created_by) VALUES
('27', 'Grand Prairie 27', 'tosborn@conlantire.com', 'store_manager', 'roderickdemarais@aol.com'),
('27', 'Grand Prairie 27', 'crichard@conlantire.com', 'assistant_manager', 'roderickdemarais@aol.com'),
('28', 'Houston 28', 'jhughes@conlantire.com', 'store_manager', 'roderickdemarais@aol.com'),
('28', 'Houston 28', 'eblais@conlantire.com', 'assistant_manager', 'roderickdemarais@aol.com');