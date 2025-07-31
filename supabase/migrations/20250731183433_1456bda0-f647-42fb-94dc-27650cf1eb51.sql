-- Fix the function by dropping and recreating with proper security settings
DROP TRIGGER IF EXISTS update_recipient_action_logs_updated_at ON public.recipient_action_logs;
DROP FUNCTION IF EXISTS public.update_recipient_logs_updated_at_column();

-- Recreate function with proper security settings
CREATE OR REPLACE FUNCTION public.update_recipient_logs_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Recreate the trigger
CREATE TRIGGER update_recipient_action_logs_updated_at
BEFORE UPDATE ON public.recipient_action_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_recipient_logs_updated_at_column();