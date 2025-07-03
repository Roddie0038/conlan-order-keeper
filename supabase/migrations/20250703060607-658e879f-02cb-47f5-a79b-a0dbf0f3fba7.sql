-- Phase 1: Database Schema Enhancements for Advanced Messaging System (Simplified)

-- Add attachments support to order_messages table
ALTER TABLE public.order_messages 
ADD COLUMN attachments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN thread_id text,
ADD COLUMN reply_to_message_id uuid REFERENCES public.order_messages(id),
ADD COLUMN message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system', 'template')),
ADD COLUMN priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Create message_attachments table for detailed file metadata
CREATE TABLE public.message_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.order_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL,
  file_type text NOT NULL,
  file_url text NOT NULL,
  storage_path text NOT NULL,
  uploaded_by text NOT NULL,
  virus_scan_status text DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected', 'failed')),
  download_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create message_read_status table for read receipts
CREATE TABLE public.message_read_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.order_messages(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  read_at timestamp with time zone DEFAULT now(),
  UNIQUE(message_id, user_email)
);

-- Create typing_status table for typing indicators
CREATE TABLE public.typing_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text NOT NULL,
  order_type text NOT NULL,
  user_email text NOT NULL,
  user_name text,
  is_typing boolean DEFAULT false,
  last_updated timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '30 seconds'),
  UNIQUE(order_id, order_type, user_email)
);

-- Create message_templates table for quick replies
CREATE TABLE public.message_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  is_system boolean DEFAULT false,
  created_by_email text NOT NULL,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create chat-attachments storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments', 
  'chat-attachments', 
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain', 'text/csv']
);

-- Enable RLS on new tables
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for message_attachments
CREATE POLICY "Users can view their accessible attachments" 
ON public.message_attachments FOR SELECT USING (true);

CREATE POLICY "Users can create attachments" 
ON public.message_attachments FOR INSERT WITH CHECK (true);

-- Basic RLS policies for message_read_status
CREATE POLICY "Users can view read status" 
ON public.message_read_status FOR SELECT USING (true);

CREATE POLICY "Users can create read status" 
ON public.message_read_status FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update read status" 
ON public.message_read_status FOR UPDATE USING (true);

-- Basic RLS policies for typing_status
CREATE POLICY "Users can view typing status" 
ON public.typing_status FOR SELECT USING (true);

CREATE POLICY "Users can manage typing status" 
ON public.typing_status FOR ALL USING (true) WITH CHECK (true);

-- Basic RLS policies for message_templates
CREATE POLICY "Users can view templates" 
ON public.message_templates FOR SELECT USING (true);

CREATE POLICY "Users can create templates" 
ON public.message_templates FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update templates" 
ON public.message_templates FOR UPDATE USING (true);

-- Basic storage policy for chat-attachments
CREATE POLICY "Users can access chat attachments" 
ON storage.objects FOR ALL 
USING (bucket_id = 'chat-attachments')
WITH CHECK (bucket_id = 'chat-attachments');

-- Create indexes for performance
CREATE INDEX idx_message_attachments_message_id ON public.message_attachments(message_id);
CREATE INDEX idx_message_read_status_message_id ON public.message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_email ON public.message_read_status(user_email);
CREATE INDEX idx_typing_status_order ON public.typing_status(order_id, order_type);
CREATE INDEX idx_typing_status_expires ON public.typing_status(expires_at);
CREATE INDEX idx_message_templates_category ON public.message_templates(category, is_active);
CREATE INDEX idx_order_messages_thread_id ON public.order_messages(thread_id);

-- Insert default message templates
INSERT INTO public.message_templates (title, content, category, is_system, created_by_email) VALUES
('Order Being Prepared', 'Your order is currently being prepared and will be ready soon.', 'status', true, 'system@conlantire.com'),
('Awaiting Inventory', 'We are currently awaiting inventory update for this order.', 'status', true, 'system@conlantire.com'),
('Please Upload Invoice', 'Could you please upload the invoice for this order?', 'request', true, 'system@conlantire.com'),
('Order Ready for Pickup', 'Your order is ready for pickup at the warehouse.', 'status', true, 'system@conlantire.com'),
('Need More Information', 'We need additional information to process this order.', 'request', true, 'system@conlantire.com'),
('Order Shipped', 'Your order has been shipped and is on its way.', 'status', true, 'system@conlantire.com');