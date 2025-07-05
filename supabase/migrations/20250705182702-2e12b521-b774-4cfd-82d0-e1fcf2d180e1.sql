-- Phase 1: Database Schema Updates for Multi-Plant Ordering System

-- Add cross_plant_order field to orders table
ALTER TABLE public.orders ADD COLUMN cross_plant_order BOOLEAN DEFAULT false;

-- Add plant switching fields to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN current_plant TEXT DEFAULT NULL,
ADD COLUMN allow_plant_switching BOOLEAN DEFAULT true,
ADD COLUMN last_plant_switch TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create plant_switch_logs table for analytics and audit tracking
CREATE TABLE public.plant_switch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  from_plant TEXT NOT NULL,
  to_plant TEXT NOT NULL,
  switch_reason TEXT DEFAULT 'user_selection',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT
);

-- Enable Row Level Security on plant_switch_logs
ALTER TABLE public.plant_switch_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for plant_switch_logs
CREATE POLICY "Users can view their own plant switch logs" 
ON public.plant_switch_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create plant switch logs" 
ON public.plant_switch_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all plant switch logs
CREATE POLICY "Admins can view all plant switch logs" 
ON public.plant_switch_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM managers 
  WHERE managers.email = (auth.jwt() ->> 'email') 
  AND managers.role IN ('super_admin', 'operations_manager', 'corporate_director') 
  AND managers.is_active = true
));

-- Add indexes for performance
CREATE INDEX idx_plant_switch_logs_user_id ON public.plant_switch_logs(user_id);
CREATE INDEX idx_plant_switch_logs_created_at ON public.plant_switch_logs(created_at);
CREATE INDEX idx_orders_cross_plant ON public.orders(cross_plant_order) WHERE cross_plant_order = true;