-- Update webhook configuration for OT integration
UPDATE public.app_platform_links
SET
  webhook_url    = 'https://hpgjbpvugasktphwntee.supabase.co/functions/v1/ordering-events-receiver',
  webhook_secret = 'd0eb8d834e71d50168cbeae35a9f7b8a6c4cb7e1bd12938c452b6ca21c1d80c5',
  hmac_enabled   = true,
  is_active      = true
WHERE webhook_type IN ('OrderPlaced','MTOOrderPlaced','WheelOrderPlaced');