-- Create cross_dock_forms table
CREATE TABLE IF NOT EXISTS public.cross_dock_forms (
  id          TEXT PRIMARY KEY,
  order_id    BIGINT,
  line_id     TEXT,
  fields      JSONB NOT NULL,
  pdf_url     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'current',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Add cross-dock form tracking to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS cross_dock_form_id TEXT,
  ADD COLUMN IF NOT EXISTS cross_dock_form_url TEXT,
  ADD COLUMN IF NOT EXISTS cross_dock_snapshot JSONB;

-- Enable RLS on cross_dock_forms
ALTER TABLE public.cross_dock_forms ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to manage their own forms
CREATE POLICY "Users can manage cross dock forms" 
ON public.cross_dock_forms 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_cross_dock_forms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cross_dock_forms_updated_at
  BEFORE UPDATE ON public.cross_dock_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_cross_dock_forms_updated_at();