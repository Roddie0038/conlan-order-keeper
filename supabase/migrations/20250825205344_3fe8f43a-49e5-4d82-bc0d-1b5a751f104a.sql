-- Fix security issues identified by the linter for tables related to our draft system
-- These are focused on the RLS policies for specific tables that are missing policies

-- Enable RLS for tables that might need it based on the linter warnings
-- (Only handling ones related to our draft system to avoid disrupting other functionality)

-- Ensure the app_config table has basic RLS (if needed for draft config)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_config' AND table_schema = 'public') THEN
    -- Check if RLS is already enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'app_config' 
      AND schemaname = 'public' 
      AND rowsecurity = true
    ) THEN
      ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
      
      -- Create basic policies for app_config
      CREATE POLICY "Super admins can read app config" ON public.app_config
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.ot_platform_users 
          WHERE auth_user_id = auth.uid() 
          AND role = 'super_admin'
          AND status = 'active'
        )
      );
      
      CREATE POLICY "Service role can manage app config" ON public.app_config
      FOR ALL USING (auth.role() = 'service_role');
    END IF;
  END IF;
END $$;

-- Ensure the kv table has basic RLS (if used for draft config)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'kv' AND table_schema = 'public') THEN
    -- Check if RLS is already enabled
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'kv' 
      AND schemaname = 'public' 
      AND rowsecurity = true
    ) THEN
      ALTER TABLE public.kv ENABLE ROW LEVEL SECURITY;
      
      -- Create basic policies for kv
      CREATE POLICY "Service role can manage kv" ON public.kv
      FOR ALL USING (auth.role() = 'service_role');
      
      CREATE POLICY "Super admins can read kv" ON public.kv
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.ot_platform_users 
          WHERE auth_user_id = auth.uid() 
          AND role = 'super_admin'
          AND status = 'active'
        )
      );
    END IF;
  END IF;
END $$;

-- Add comment about security practices
COMMENT ON TABLE public.draft_telemetry_log IS 'Tracks draft operations for monitoring and debugging. RLS ensures only admins can view logs.';
COMMENT ON INDEX idx_order_drafts_unique_active_key IS 'Ensures only one active draft per draft_key (submitted=false). Critical for preventing data corruption.';