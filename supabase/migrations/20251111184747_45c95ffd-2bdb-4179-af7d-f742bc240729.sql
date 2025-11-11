-- Create user_notifications table
CREATE TABLE user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  event_type text NOT NULL,
  order_number text,
  order_type text,
  store_ref text,
  plant_code text,
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(user_id, read);
CREATE INDEX idx_user_notifications_created ON user_notifications(created_at DESC);
CREATE INDEX idx_user_notifications_store ON user_notifications(store_ref);
CREATE INDEX idx_user_notifications_plant ON user_notifications(plant_code);

-- Enable realtime
ALTER TABLE user_notifications REPLICA IDENTITY FULL;

-- RLS Policies
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON user_notifications FOR INSERT
  WITH CHECK (true);

-- Create notification settings table
CREATE TABLE user_notification_settings (
  user_id uuid PRIMARY KEY,
  email_enabled boolean DEFAULT true,
  in_app_enabled boolean DEFAULT true,
  notify_order_created boolean DEFAULT true,
  notify_order_updated boolean DEFAULT true,
  notify_order_completed boolean DEFAULT true,
  notify_order_approved boolean DEFAULT true,
  notify_order_denied boolean DEFAULT true,
  notify_warranty_events boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own settings"
  ON user_notification_settings FOR ALL
  USING (auth.uid() = user_id);