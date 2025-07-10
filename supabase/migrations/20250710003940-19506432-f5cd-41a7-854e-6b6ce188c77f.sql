-- Phase 1: Add missing roles to both platform enums

-- Add team_lead to ot_platform (OT Platform already has service_manager)
ALTER TYPE ot_user_role ADD VALUE IF NOT EXISTS 'team_lead';

-- Add both service_manager and team_lead to ordering platform
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'service_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'team_lead';

-- Note: These new roles will inherit default permissions:
-- - service_manager: Similar to store_manager level access
-- - team_lead: Similar to warehouse_staff level access
-- Specific role-based permissions can be refined in future updates