-- Add platform field to notification_logs table if it doesn't exist
-- This will help distinguish between ordering_platform and ot_platform notifications

DO $$ 
BEGIN
    -- Check if platform column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'platform') THEN
        ALTER TABLE notification_logs ADD COLUMN platform text DEFAULT 'ordering_platform';
        
        -- Add comment for clarity
        COMMENT ON COLUMN notification_logs.platform IS 'Source platform: ordering_platform or ot_platform';
    END IF;
    
    -- Check if order_type column exists, if not add it  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'order_type') THEN
        ALTER TABLE notification_logs ADD COLUMN order_type text;
        
        -- Add comment for clarity
        COMMENT ON COLUMN notification_logs.order_type IS 'Type of order: TRANSFER, MTO, WHEEL_POWDER_COATING, MESSAGE';
    END IF;
    
    -- Check if cross_dock_order column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'cross_dock_order') THEN
        ALTER TABLE notification_logs ADD COLUMN cross_dock_order boolean DEFAULT false;
        
        -- Add comment for clarity  
        COMMENT ON COLUMN notification_logs.cross_dock_order IS 'Whether this is a cross-dock order';
    END IF;
    
    -- Check if email_provider column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_logs' AND column_name = 'email_provider') THEN
        ALTER TABLE notification_logs ADD COLUMN email_provider text DEFAULT 'resend';
        
        -- Add comment for clarity
        COMMENT ON COLUMN notification_logs.email_provider IS 'Email provider used: resend, smtp, etc.';
    END IF;
    
END $$;