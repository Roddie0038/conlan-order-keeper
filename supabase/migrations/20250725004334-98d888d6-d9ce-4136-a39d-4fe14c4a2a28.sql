-- CRITICAL SECURITY FIX PART 2: Fix the duplicate policy issue and continue with security fixes

-- Drop the existing policy first to avoid duplicates
DROP POLICY IF EXISTS "System can create notification logs" ON public.notification_logs;

-- Create the corrected policy
CREATE POLICY "System can create notification logs"
  ON public.notification_logs
  FOR INSERT
  WITH CHECK (true);

-- Add missing RLS policies for tables that need them
CREATE POLICY "Admins can view all notification logs"
  ON public.notification_logs
  FOR SELECT
  USING (is_ot_super_admin() OR is_ot_operations_manager());

-- Fix email logs to be more secure
DROP POLICY IF EXISTS "Email logs are viewable by authenticated users" ON public.email_logs;
CREATE POLICY "Admins can view email logs"
  ON public.email_logs
  FOR SELECT
  USING (is_cross_platform_super_admin());

DROP POLICY IF EXISTS "Email logs can be inserted by authenticated users" ON public.email_logs;
CREATE POLICY "System can create email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add proper RLS policies for pending_registrations
CREATE POLICY "Admins can manage pending registrations"
  ON public.pending_registrations
  FOR ALL
  USING (is_cross_platform_super_admin())
  WITH CHECK (is_cross_platform_super_admin());

CREATE POLICY "Users can create their own registration"
  ON public.pending_registrations
  FOR INSERT
  WITH CHECK (true);

-- Remove security definer views that are flagged as security risks
-- These will be replaced with proper functions later
DROP VIEW IF EXISTS zone_summary_view CASCADE;

-- Create a secure function to get zone summaries instead
CREATE OR REPLACE FUNCTION public.get_secure_zone_summary()
RETURNS TABLE(
  id uuid,
  label text,
  location text,
  plant text,
  last_scanned_at timestamp with time zone,
  zone_alert_status text,
  total_items bigint,
  sku_count bigint,
  avg_fill_rate numeric,
  last_scan_activity timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    zsv.id,
    zsv.label,
    zsv.location,
    zsv.plant,
    zsv.last_scanned_at,
    zsv.zone_alert_status,
    zsv.total_items,
    zsv.sku_count,
    zsv.avg_fill_rate,
    zsv.last_scan_activity
  FROM zone_summary_view zsv
  WHERE zsv.plant = get_current_user_plant()
    AND EXISTS (
      SELECT 1 FROM inventory_users 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    );
$function$;

-- Create proper role-based access control system
-- Create user roles enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for proper role management
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    granted_by uuid REFERENCES auth.users(id),
    granted_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
    )
  );

CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Create a security definer function to check user roles
CREATE OR REPLACE FUNCTION public.user_has_role(user_id uuid, role_name user_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role = $2
  );
$function$;

-- Create helper function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_user_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path TO 'public'
AS $function$
  SELECT user_has_role(auth.uid(), 'super_admin'::user_role);
$function$;