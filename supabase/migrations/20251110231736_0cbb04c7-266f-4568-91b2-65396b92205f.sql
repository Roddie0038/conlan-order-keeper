-- 1) Ensure the OT platform row exists and carries the agreed secret
INSERT INTO app_platforms (platform_key, platform_name, webhook_secret, is_active)
VALUES ('ot-platform', 'OT Platform', 'f5b0895c-807a-41a0-b09a-4697a8d54665', true)
ON CONFLICT (platform_key)
DO UPDATE SET
  webhook_secret = EXCLUDED.webhook_secret,
  platform_name  = EXCLUDED.platform_name,
  is_active      = true;

-- 2) Delete existing OT platform links and recreate them
DO $$
DECLARE
  ot_platform_id uuid;
BEGIN
  SELECT id INTO ot_platform_id FROM app_platforms WHERE platform_key = 'ot-platform';
  
  -- Delete existing links for this platform
  DELETE FROM app_platform_links WHERE platform_id = ot_platform_id;
  
  -- Insert fresh links for common event types
  INSERT INTO app_platform_links (
    platform_id, 
    webhook_type, 
    webhook_url, 
    webhook_secret,
    hmac_enabled,
    is_active
  )
  VALUES
    (ot_platform_id, 'order.created',   'https://hpgjbpvugasktphwntee.supabase.co/functions/v1/ordering-events-receiver', 'f5b0895c-807a-41a0-b09a-4697a8d54665', true, true),
    (ot_platform_id, 'order.updated',   'https://hpgjbpvugasktphwntee.supabase.co/functions/v1/ordering-events-receiver', 'f5b0895c-807a-41a0-b09a-4697a8d54665', true, true),
    (ot_platform_id, 'order.completed', 'https://hpgjbpvugasktphwntee.supabase.co/functions/v1/ordering-events-receiver', 'f5b0895c-807a-41a0-b09a-4697a8d54665', true, true);
END $$;