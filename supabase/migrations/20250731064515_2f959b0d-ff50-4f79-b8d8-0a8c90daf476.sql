-- Create order_email_overrides table for recipient customizations
CREATE TABLE public.order_email_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID, -- For order-specific overrides
  template_id UUID, -- For template-level overrides  
  store_number TEXT NOT NULL,
  plant TEXT,
  email_type TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('add', 'remove')),
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_role TEXT,
  is_default_recipient BOOLEAN DEFAULT FALSE, -- Track if removing a default
  added_by_email TEXT NOT NULL,
  added_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE public.order_email_overrides ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage overrides for their accessible stores
CREATE POLICY "Users can manage email overrides for accessible stores" 
ON public.order_email_overrides 
FOR ALL 
USING (
  auth.uid() IS NOT NULL AND (
    is_ot_super_admin() OR 
    is_ot_operations_manager() OR
    has_store_access(store_number) OR
    has_plant_access(plant) OR
    added_by_email = auth.email()
  )
);

-- Create index for performance
CREATE INDEX idx_order_email_overrides_lookup ON public.order_email_overrides 
(store_number, plant, email_type, is_active);

-- Create trigger for store number normalization
CREATE TRIGGER trigger_normalize_overrides_store
  BEFORE INSERT OR UPDATE ON public.order_email_overrides
  FOR EACH ROW
  EXECUTE FUNCTION trigger_normalize_store_format();