-- Create ordering_store_list table for get-stores edge function
CREATE TABLE IF NOT EXISTS public.ordering_store_list (
  id SERIAL PRIMARY KEY,
  store_ref TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  plant TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ordering_store_list ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read store list
CREATE POLICY "Anyone can read store list"
  ON public.ordering_store_list
  FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify store list
CREATE POLICY "Admins can manage store list"
  ON public.ordering_store_list
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Insert store data
INSERT INTO public.ordering_store_list (store_ref, label, plant) VALUES
  -- Mulberry 099 Plant Stores (001-011)
  ('001', 'Fort Myers 001', 'Mulberry 099'),
  ('002', 'Tampa 002', 'Mulberry 099'),
  ('003', 'St. Pete 003', 'Mulberry 099'),
  ('004', 'Sarasota 004', 'Mulberry 099'),
  ('005', 'Lakeland 005', 'Mulberry 099'),
  ('006', 'Fort Pierce 006', 'Mulberry 099'),
  ('007', 'Orlando 007', 'Mulberry 099'),
  ('008', 'Lake Wales 008', 'Mulberry 099'),
  ('009', 'Gainesville 009', 'Mulberry 099'),
  ('010', 'Jacksonville 010', 'Mulberry 099'),
  ('011', 'Ocala 011', 'Mulberry 099'),
  
  -- Grand Prairie 097 Plant Stores
  ('022', 'Fort Worth 022', 'Grand Prairie 097'),
  ('027', 'Grand Prairie 027', 'Grand Prairie 097'),
  ('028', 'Houston 028', 'Grand Prairie 097'),
  ('029', 'San Antonio 029', 'Grand Prairie 097'),
  ('030', 'Oklahoma 030', 'Grand Prairie 097'),
  ('032', 'Little Rock 032', 'Grand Prairie 097'),
  ('033', 'Kansas 033', 'Grand Prairie 097'),
  ('035', 'Laredo 035', 'Grand Prairie 097'),
  ('036', 'Tulsa 036', 'Grand Prairie 097'),
  ('039', 'Austin 039', 'Grand Prairie 097'),
  
  -- Romulus 098 Plant Stores
  ('040', 'Romulus 040', 'Romulus 098'),
  ('041', 'Detroit 041', 'Romulus 098'),
  ('042', 'Toledo 042', 'Romulus 098'),
  ('043', 'Columbus 043', 'Romulus 098'),
  ('044', 'Flint 044', 'Romulus 098'),
  ('045', 'South Bend 045', 'Romulus 098')
ON CONFLICT (store_ref) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_ordering_store_list_plant 
  ON public.ordering_store_list(plant);

-- Add trigger for updated_at
CREATE TRIGGER set_ordering_store_list_updated_at
  BEFORE UPDATE ON public.ordering_store_list
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();