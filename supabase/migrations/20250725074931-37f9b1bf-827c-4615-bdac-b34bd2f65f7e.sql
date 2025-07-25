-- Phase 1: Database Schema and Data Migration

-- First, add missing columns to ordering_email_recipients table
ALTER TABLE public.ordering_email_recipients 
ADD COLUMN IF NOT EXISTS plant text,
ADD COLUMN IF NOT EXISTS user_role text DEFAULT 'store_manager',
ADD COLUMN IF NOT EXISTS notification_types text[] DEFAULT ARRAY['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint'];

-- Update the table to support all email types
UPDATE public.ordering_email_recipients 
SET email_type = 'all_notifications' 
WHERE email_type = 'order_confirmation';

-- Migrate data from ot_platform_users to ordering_email_recipients
-- This will populate the table with real email data based on roles

INSERT INTO public.ordering_email_recipients (
  store_number, 
  store_name, 
  plant,
  recipient_email, 
  role, 
  user_role,
  email_type, 
  notification_types,
  is_active, 
  created_by
)
SELECT DISTINCT
  CASE 
    WHEN store IS NOT NULL THEN normalize_store_format(store)
    ELSE NULL
  END as store_number,
  CASE 
    WHEN store IS NOT NULL THEN store
    ELSE NULL
  END as store_name,
  CASE 
    WHEN plant IS NOT NULL THEN plant
    ELSE NULL
  END as plant,
  email as recipient_email,
  CASE 
    WHEN role = 'store_manager' THEN 'Store Manager'
    WHEN role = 'service_manager' THEN 'Service Manager'
    WHEN role = 'warehouse_manager' THEN 'Warehouse Manager'
    WHEN role = 'warehouse_coordinator' THEN 'Warehouse Coordinator'
    WHEN role = 'retread_manager' THEN 'Retread Manager'
    WHEN role = 'plant_manager' THEN 'Plant Manager'
    WHEN role = 'operations_manager' THEN 'Operations Manager'
    ELSE 'Store Manager'
  END as role,
  role as user_role,
  'all_notifications' as email_type,
  CASE 
    -- Store Managers & Service Managers: All notifications for their store
    WHEN role IN ('store_manager', 'service_manager') THEN 
      ARRAY['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint']
    -- Warehouse Managers: All except warranty
    WHEN role = 'warehouse_manager' THEN 
      ARRAY['transfer', 'cross_dock', 'mto', 'wheel', 'complaint']
    -- Warehouse Coordinators: No warranty or complaint
    WHEN role = 'warehouse_coordinator' THEN 
      ARRAY['transfer', 'cross_dock', 'mto', 'wheel']
    -- Retread Managers: Only mto, warranty, complaint
    WHEN role = 'retread_manager' THEN 
      ARRAY['mto', 'warranty', 'complaint']
    -- Plant Managers & Operations Managers: Only warranty, complaint
    WHEN role IN ('plant_manager', 'operations_manager') THEN 
      ARRAY['warranty', 'complaint']
    ELSE 
      ARRAY['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint']
  END as notification_types,
  CASE 
    WHEN status = 'active' THEN true
    ELSE false
  END as is_active,
  'system_migration' as created_by
FROM public.ot_platform_users
WHERE status = 'active' 
  AND email IS NOT NULL
ON CONFLICT (recipient_email, store_number, email_type) DO UPDATE SET
  notification_types = EXCLUDED.notification_types,
  user_role = EXCLUDED.user_role,
  plant = EXCLUDED.plant,
  is_active = EXCLUDED.is_active;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ordering_email_recipients_store_type 
ON public.ordering_email_recipients(store_number, email_type);

CREATE INDEX IF NOT EXISTS idx_ordering_email_recipients_plant_type 
ON public.ordering_email_recipients(plant, email_type);

CREATE INDEX IF NOT EXISTS idx_ordering_email_recipients_notifications 
ON public.ordering_email_recipients USING GIN(notification_types);