
-- Phase 1: Create profiles table to map auth.uid() to role and store
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  store TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('store_manager', 'warehouse_admin')),
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Only authenticated users can view profiles (for admin interface)
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Only warehouse_admin can insert/update/delete profiles
CREATE POLICY "Warehouse admins can manage profiles" ON public.profiles
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'warehouse_admin'
    )
  );

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, store, role, name)
  VALUES (
    NEW.id,
    NEW.email,
    'Unassigned', -- Default store, admin will assign later
    'store_manager', -- Default role
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to auto-populate sender fields in order_messages
CREATE OR REPLACE FUNCTION public.autofill_order_message_sender()
RETURNS TRIGGER AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Get the user's profile data
  SELECT email, store, role, name
  INTO user_profile
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- If profile found, populate the sender fields
  IF FOUND THEN
    NEW.sender_email := user_profile.email;
    NEW.sender_store := user_profile.store;
    NEW.sender_role := user_profile.role;
    NEW.sender_name := user_profile.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-fill sender fields before insert
DROP TRIGGER IF EXISTS fill_sender_fields ON order_messages;
CREATE TRIGGER fill_sender_fields
  BEFORE INSERT ON order_messages
  FOR EACH ROW EXECUTE FUNCTION public.autofill_order_message_sender();

-- Phase 2: Update RLS Policy on order_messages to use auth.uid()
DROP POLICY IF EXISTS "Store managers can access their store messages" ON order_messages;

CREATE POLICY "Store managers can access their store messages" ON order_messages
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'store_manager'
    AND profiles.store = (
      SELECT COALESCE(
        (SELECT orders.store FROM orders 
         WHERE orders.id::text = order_messages.order_id 
         AND order_messages.order_type = 'orders'),
        (SELECT mto_orders.store FROM mto_orders 
         WHERE mto_orders.id::text = order_messages.order_id 
         AND order_messages.order_type = 'mto_orders'),
        (SELECT wheel_orders.store FROM wheel_orders 
         WHERE wheel_orders.id::text = order_messages.order_id 
         AND order_messages.order_type = 'wheel_orders')
      )
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'warehouse_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'store_manager'
    AND profiles.store = (
      SELECT COALESCE(
        (SELECT orders.store FROM orders 
         WHERE orders.id::text = order_messages.order_id 
         AND order_messages.order_type = 'orders'),
        (SELECT mto_orders.store FROM mto_orders 
         WHERE mto_orders.id::text = order_messages.order_id 
         AND order_messages.order_type = 'mto_orders'),
        (SELECT wheel_orders.store FROM wheel_orders 
         WHERE wheel_orders.id::text = order_messages.order_id 
         AND order_messages.order_type = 'wheel_orders')
      )
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'warehouse_admin'
  )
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id_role_store ON public.profiles (id, role, store);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
