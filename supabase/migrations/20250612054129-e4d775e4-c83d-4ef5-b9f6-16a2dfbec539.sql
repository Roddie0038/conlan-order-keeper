
-- Extend order_messages table with email integration fields
ALTER TABLE public.order_messages 
ADD COLUMN IF NOT EXISTS message_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS reply_to_email_id TEXT,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'platform' CHECK (source IN ('platform', 'email_reply', 'email_direct'));

-- Add indexes for efficient message threading queries
CREATE INDEX IF NOT EXISTS idx_order_messages_message_id ON public.order_messages(message_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_reply_to ON public.order_messages(reply_to_email_id);
CREATE INDEX IF NOT EXISTS idx_order_messages_order_thread ON public.order_messages(order_id, created_at);
CREATE INDEX IF NOT EXISTS idx_order_messages_source ON public.order_messages(source);

-- Update RLS policies to handle new fields properly
-- The existing policies should work fine with the new columns since they're based on order access
-- But let's ensure the policies are optimized for the new use cases

-- Add a function to generate unique message IDs for email threading
CREATE OR REPLACE FUNCTION generate_message_id(order_id_param TEXT, sender_email_param TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT(
    'msg-',
    EXTRACT(EPOCH FROM NOW())::BIGINT,
    '-',
    SUBSTRING(MD5(CONCAT(order_id_param, sender_email_param)), 1, 8)
  );
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-generate message_id if not provided
CREATE OR REPLACE FUNCTION auto_generate_message_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.message_id IS NULL THEN
    NEW.message_id := generate_message_id(NEW.order_id, NEW.sender_email);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_message_id ON public.order_messages;
CREATE TRIGGER trigger_auto_generate_message_id
  BEFORE INSERT ON public.order_messages
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_message_id();
