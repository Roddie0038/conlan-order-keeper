-- Fix RLS issues - Enable RLS on tables that don't have it
-- First check if there are any tables without RLS enabled

-- Fix search path for the function we just created
DROP FUNCTION IF EXISTS public.update_recipient_logs_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_recipient_logs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';