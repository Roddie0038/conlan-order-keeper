-- CRITICAL SECURITY FIX: Enable RLS on all public tables that are missing it

-- Enable RLS on tables that currently have policies but RLS disabled
ALTER TABLE public.approved_treads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mto_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordering_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordering_email_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_trigger_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_platform_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_auth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_password_resets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ot_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;

-- Fix overly permissive policies by tightening access controls
-- Replace overly broad "true" policies with proper role-based access

-- Fix approved_treads policies to be more restrictive
DROP POLICY IF EXISTS "Admins can manage approved treads" ON public.approved_treads;
CREATE POLICY "Super admins can manage approved treads"
  ON public.approved_treads
  FOR ALL
  USING (is_cross_platform_super_admin())
  WITH CHECK (is_cross_platform_super_admin());

-- Fix message policies to be more restrictive
DROP POLICY IF EXISTS "Users can create attachments" ON public.message_attachments;
CREATE POLICY "Authenticated users can create attachments"
  ON public.message_attachments
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can view their accessible attachments" ON public.message_attachments;
CREATE POLICY "Users can view their attachments"
  ON public.message_attachments
  FOR SELECT
  USING (uploaded_by = auth.email());

-- Fix message read status policies
DROP POLICY IF EXISTS "Users can create read status" ON public.message_read_status;
CREATE POLICY "Users can create their own read status"
  ON public.message_read_status
  FOR INSERT
  WITH CHECK (user_email = auth.email());

DROP POLICY IF EXISTS "Users can update read status" ON public.message_read_status;
CREATE POLICY "Users can update their own read status"
  ON public.message_read_status
  FOR UPDATE
  USING (user_email = auth.email());

DROP POLICY IF EXISTS "Users can view read status" ON public.message_read_status;
CREATE POLICY "Users can view their own read status"
  ON public.message_read_status
  FOR SELECT
  USING (user_email = auth.email());

-- Fix message templates policies
DROP POLICY IF EXISTS "Users can create templates" ON public.message_templates;
CREATE POLICY "Authenticated users can create templates"
  ON public.message_templates
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by_email = auth.email());

DROP POLICY IF EXISTS "Users can update templates" ON public.message_templates;
CREATE POLICY "Users can update their own templates"
  ON public.message_templates
  FOR UPDATE
  USING (created_by_email = auth.email());

DROP POLICY IF EXISTS "Users can view templates" ON public.message_templates;
CREATE POLICY "Users can view active templates and their own"
  ON public.message_templates
  FOR SELECT
  USING (is_active = true OR created_by_email = auth.email());

-- Fix order messages policies
DROP POLICY IF EXISTS "Users can create order messages" ON public.order_messages;
CREATE POLICY "Authenticated users can create order messages"
  ON public.order_messages
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND sender_email = auth.email());

DROP POLICY IF EXISTS "Users can update order messages" ON public.order_messages;
CREATE POLICY "Users can update their own order messages"
  ON public.order_messages
  FOR UPDATE
  USING (sender_email = auth.email());

DROP POLICY IF EXISTS "Users can view order messages" ON public.order_messages;
CREATE POLICY "Users can view order messages they're involved in"
  ON public.order_messages
  FOR SELECT
  USING (
    sender_email = auth.email() OR
    is_cross_platform_super_admin() OR
    has_plant_access((SELECT plant FROM orders WHERE id::text = order_id LIMIT 1)) OR
    has_store_access((SELECT store FROM orders WHERE id::text = order_id LIMIT 1))
  );

-- Fix notification logs policies to be more restrictive
DROP POLICY IF EXISTS "Allow all operations on notification_logs" ON public.notification_logs;
CREATE POLICY "System can create notification logs"
  ON public.notification_logs
  FOR INSERT
  WITH CHECK (true);

-- Improve function security by setting proper search_path
CREATE OR REPLACE FUNCTION public.normalize_store_format(input_store text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Handle null or empty input
    IF input_store IS NULL OR input_store = '' THEN
        RETURN input_store;
    END IF;
    
    -- Trim whitespace and convert to lowercase for comparison
    input_store := TRIM(input_store);
    
    -- Fort Worth 022 (Store 22) variants
    IF input_store ~* '^(22|022|store\s*22|fort\s*worth\s*22|forth\s*worth\s*22|fort\s*worth\s*022|fw\s*22|fw\s*022)$' THEN
        RETURN 'Fort Worth 022';
    END IF;
    
    -- Grand Prairie 027 (Store 27) variants  
    IF input_store ~* '^(27|027|store\s*27|grand\s*prairie\s*27|grand\s*prarie\s*27|grand\s*prairie\s*027|gp\s*27|gp\s*027)$' THEN
        RETURN 'Grand Prairie 027';
    END IF;
    
    -- Houston 028 (Store 28) variants
    IF input_store ~* '^(28|028|store\s*28|houston\s*28|houston\s*028|hou\s*28|hou\s*028)$' THEN
        RETURN 'Houston 028';
    END IF;
    
    -- San Antonio 029 (Store 29) variants
    IF input_store ~* '^(29|029|store\s*29|san\s*antonio\s*29|san\s*antonio\s*029|sa\s*29|sa\s*029)$' THEN
        RETURN 'San Antonio 029';
    END IF;
    
    -- Oklahoma City 030 (Store 30) variants
    IF input_store ~* '^(30|030|store\s*30|oklahoma\s*30|oklahoma\s*city\s*30|oklahoma\s*city\s*030|okc\s*30|okc\s*030)$' THEN
        RETURN 'Oklahoma City 030';
    END IF;
    
    -- Little Rock 032 (Store 32) variants
    IF input_store ~* '^(32|032|store\s*32|little\s*rock\s*32|little\s*rock\s*032|lr\s*32|lr\s*032)$' THEN
        RETURN 'Little Rock 032';
    END IF;
    
    -- Kansas City 033 (Store 33) variants
    IF input_store ~* '^(33|033|store\s*33|kansas\s*33|kansas\s*city\s*33|kansas\s*city\s*033|kc\s*33|kc\s*033)$' THEN
        RETURN 'Kansas City 033';
    END IF;
    
    -- Laredo 035 (Store 35) variants
    IF input_store ~* '^(35|035|store\s*35|laredo\s*35|laredo\s*035)$' THEN
        RETURN 'Laredo 035';
    END IF;
    
    -- Tulsa 036 (Store 36) variants
    IF input_store ~* '^(36|036|store\s*36|tulsa\s*36|tulsa\s*036)$' THEN
        RETURN 'Tulsa 036';
    END IF;
    
    -- Austin 039 (Store 39) variants
    IF input_store ~* '^(39|039|store\s*39|austin\s*39|austin\s*039)$' THEN
        RETURN 'Austin 039';
    END IF;
    
    -- If already in correct format, return as-is
    IF input_store IN ('Fort Worth 022', 'Grand Prairie 027', 'Houston 028', 'San Antonio 029', 'Oklahoma City 030', 'Little Rock 032', 'Kansas City 033', 'Laredo 035', 'Tulsa 036', 'Austin 039') THEN
        RETURN input_store;
    END IF;
    
    -- For unrecognized formats, return original
    RETURN input_store;
END;
$function$;

-- Update other functions to have proper search_path
CREATE OR REPLACE FUNCTION public.normalize_plant_name(input_plant text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Handle null, empty, or whitespace-only input
    IF input_plant IS NULL OR TRIM(input_plant) = '' THEN
        RETURN 'Grand Prairie 097';
    END IF;
    
    -- Normalize case and trim whitespace
    input_plant := TRIM(lower(input_plant));
    
    -- Grand Prairie 097 variants (most common)
    IF input_plant IN (
        'grand prairie 97', 'grand prairie 097', 'grand prairie', 'grandprairie',
        'gp 97', 'gp 097', 'gp', '97', '097',
        'grand praire', 'grand prarie',  -- common typos
        'texas', 'dallas', 'fort worth plant'
    ) THEN 
        RETURN 'Grand Prairie 097';
    END IF;
    
    -- Mulberry 099 variants
    IF input_plant IN (
        'mulberry 99', 'mulberry 099', 'mulberry', 
        'mb 99', 'mb 099', 'mb', '99', '099',
        'florida', 'central florida', 'lakeland'
    ) THEN 
        RETURN 'Mulberry 099';
    END IF;
    
    -- Romulus 098 variants  
    IF input_plant IN (
        'romulus 98', 'romulus 098', 'romulus',
        'rom 98', 'rom 098', 'rom', '98', '098', 
        'michigan', 'detroit', 'midwest'
    ) THEN 
        RETURN 'Romulus 098';
    END IF;
    
    -- Special administrative cases
    IF input_plant IN ('all plants', 'all', 'admin', 'corporate', 'headquarters', 'hq') THEN 
        RETURN 'All Plants';
    END IF;
    
    -- Handle unknown/legacy cases
    IF input_plant IN ('unknown', 'null', 'n/a', 'tbd', 'pending') THEN
        RETURN 'Grand Prairie 097';
    END IF;
    
    -- Default fallback
    RETURN 'Grand Prairie 097';
END;
$function$;