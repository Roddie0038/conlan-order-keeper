-- Create app_platforms table for external platform configurations
CREATE TABLE IF NOT EXISTS public.app_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_key TEXT UNIQUE NOT NULL,
  platform_name TEXT NOT NULL,
  description TEXT,
  base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create app_platform_links table for webhook endpoint configurations
CREATE TABLE IF NOT EXISTS public.app_platform_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id UUID REFERENCES public.app_platforms(id) ON DELETE CASCADE,
  webhook_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT,
  hmac_enabled BOOLEAN DEFAULT false,
  hmac_algorithm TEXT DEFAULT 'sha256',
  rate_limit_per_minute INTEGER DEFAULT 60,
  timeout_seconds INTEGER DEFAULT 30,
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create webhook_deliveries table for logging all webhook attempts
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_link_id UUID REFERENCES public.app_platform_links(id) ON DELETE SET NULL,
  webhook_type TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  request_method TEXT DEFAULT 'POST',
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  duration_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,
  idempotency_key TEXT,
  hmac_signature TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create webhook_analytics table for aggregated stats
CREATE TABLE IF NOT EXISTS public.webhook_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_link_id UUID REFERENCES public.app_platform_links(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  avg_duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(platform_link_id, date)
);

-- Insert default platforms for existing hardcoded webhooks
INSERT INTO public.app_platforms (platform_key, platform_name, description, is_active) VALUES
  ('google_sheets', 'Google Sheets', 'Google Apps Script webhooks for order logging', true),
  ('zapier', 'Zapier', 'Zapier webhook integration for admin orders', true)
ON CONFLICT (platform_key) DO NOTHING;

-- Insert default webhook links for existing hardcoded URLs
WITH google_platform AS (
  SELECT id FROM public.app_platforms WHERE platform_key = 'google_sheets'
),
zapier_platform AS (
  SELECT id FROM public.app_platforms WHERE platform_key = 'zapier'
)
INSERT INTO public.app_platform_links (platform_id, webhook_type, webhook_url, is_active) VALUES
  ((SELECT id FROM google_platform), 'ORDERS', 'https://script.google.com/macros/s/AKfycbxQPqBQwA0IIMN3_LH_FgYY1jU5FMP1U0Z8RtMFSAjH_Kz-5IsKa5xNDpVxMfbN2zIA/exec', true),
  ((SELECT id FROM google_platform), 'WHEEL_ORDERS', 'https://script.google.com/macros/s/AKfycbyHgFTW0pDGhZOHwUjW5zeqWebs6pXH53Ud8FFC-87bMxCNEf406j0Eu8dQvo_zAhJUEQ/exec', true),
  ((SELECT id FROM google_platform), 'MTO_ORDERS', 'https://script.google.com/macros/s/AKfycbx9pgfa8FSVcatTgLcDzeeVcB56h2LdAPD4w51Y41uOOuFWgavdgGAFg1LcFGp7AEdtxA/exec', true),
  ((SELECT id FROM zapier_platform), 'ADMIN_ORDERS', 'https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/', true)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON public.webhook_deliveries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_platform_link_id ON public.webhook_deliveries(platform_link_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_idempotency_key ON public.webhook_deliveries(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_webhook_analytics_date ON public.webhook_analytics(date DESC);

-- Enable RLS
ALTER TABLE public.app_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_platform_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for admins only
CREATE POLICY "Admins can manage platforms" ON public.app_platforms FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage platform links" ON public.app_platform_links FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can view deliveries" ON public.webhook_deliveries FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view analytics" ON public.webhook_analytics FOR SELECT USING (is_admin());

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_webhook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_platforms_updated_at
  BEFORE UPDATE ON public.app_platforms
  FOR EACH ROW EXECUTE FUNCTION public.update_webhook_updated_at();

CREATE TRIGGER update_platform_links_updated_at
  BEFORE UPDATE ON public.app_platform_links
  FOR EACH ROW EXECUTE FUNCTION public.update_webhook_updated_at();