
-- Create the order_messages table for storing order-related messages
CREATE TABLE public.order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  order_type TEXT CHECK (order_type IN ('orders', 'mto_orders', 'wheel_orders')) NOT NULL,
  message_text TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_role TEXT CHECK (sender_role IN ('store_manager', 'warehouse_admin')) NOT NULL,
  sender_name TEXT,
  sender_store TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Email integration fields
  message_id TEXT,
  reply_to_email_id TEXT,
  email_sent BOOLEAN DEFAULT false,
  source TEXT CHECK (source IN ('platform', 'email_reply', 'email_direct')) DEFAULT 'platform'
);

-- Enable Row Level Security
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for accessing messages
-- Users can view messages for orders they have access to
CREATE POLICY "Users can view order messages" 
  ON public.order_messages 
  FOR SELECT 
  USING (true); -- Will be refined based on user roles later

-- Users can create messages
CREATE POLICY "Users can create order messages" 
  ON public.order_messages 
  FOR INSERT 
  WITH CHECK (true); -- Will be refined based on user roles later

-- Users can update messages (for read status)
CREATE POLICY "Users can update order messages" 
  ON public.order_messages 
  FOR UPDATE 
  USING (true); -- Will be refined based on user roles later

-- Create indexes for performance
CREATE INDEX idx_order_messages_order_id ON public.order_messages(order_id);
CREATE INDEX idx_order_messages_order_type ON public.order_messages(order_type);
CREATE INDEX idx_order_messages_created_at ON public.order_messages(created_at DESC);
