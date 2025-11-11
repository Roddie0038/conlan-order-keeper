-- Add unique constraint on webhook_type for app_platform_links
-- This allows ON CONFLICT (webhook_type) to work in upsert operations

ALTER TABLE public.app_platform_links
  ADD CONSTRAINT app_platform_links_webhook_type_key 
  UNIQUE (webhook_type);