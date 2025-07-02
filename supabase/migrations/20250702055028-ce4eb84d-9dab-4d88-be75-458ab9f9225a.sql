-- Insert individual store managers and service managers with correct role format
-- Clear existing test data and insert new manager records

-- First, let's update existing managers that might conflict
UPDATE managers SET is_active = false WHERE email IN (
  'roderickdemarais@aol.com', 
  'rdemarais@conlantire.com',
  'conlantire97@gmail.com',
  'jhughes@conlantire.com',
  'eblais@conlantire.com',
  'rpetty@conlantire.com',
  'pvallejo@conlantire.com',
  'dbaumgardner@conlantire.com',
  'bhunt@conlantire.com',
  'jmilliken@conlantire.com',
  'rowilson@conlantire.com',
  'lallen@conlantire.com',
  'lguerra@conlantire.com',
  'hgamez@conlantire.com',
  'kbrown@conlantire.com',
  'borozco@conlantire.com'
);

-- Insert new individual managers with correct role format
INSERT INTO managers (email, name, role, store_number, plant_code, is_active) VALUES 
-- Fort Worth 22
('jmartinez@conlantire.com', 'Juan Martinez', 'store_manager', '22', 'Grand Prairie 97', true),

-- Grand Prairie 27
('tosborn@conlantire.com', 'Thomas Osborn', 'store_manager', '27', 'Grand Prairie 97', true),
('crichard@conlantire.com', 'Cody Richard', 'service_manager', '27', 'Grand Prairie 97', true),

-- Houston 28
('jhughes@conlantire.com', 'Joshua Hughes', 'store_manager', '28', 'Grand Prairie 97', true),
('eblais@conlantire.com', 'Eddie Blais', 'service_manager', '28', 'Grand Prairie 97', true),

-- San Antonio 29
('pvallejo@conlantire.com', 'Patrick Vallejo', 'store_manager', '29', 'Grand Prairie 97', true),
('rpetty@conlantire.com', 'Ryan Petty', 'service_manager', '29', 'Grand Prairie 97', true),

-- Oklahoma City 30
('dbaumgardner@conlantire.com', 'Derek Baumgardner', 'store_manager', '30', 'Grand Prairie 97', true),
('bhunt@conlantire.com', 'Blaine Hunt', 'service_manager', '30', 'Grand Prairie 97', true),

-- Little Rock 32
('jmilliken@conlantire.com', 'John Milliken', 'store_manager', '32', 'Grand Prairie 97', true),
('mkaufman@conlantire.com', 'Melvin (Lee) Kaufman', 'service_manager', '32', 'Grand Prairie 97', true),

-- Kansas City 33
('rjohnson@conlantire.com', 'Robert (Gage) Johnson', 'store_manager', '33', 'Grand Prairie 97', true),
('lallen@conlantire.com', 'Lauren Allen', 'service_manager', '33', 'Grand Prairie 97', true),

-- Laredo 35
('hgamez@conlantire.com', 'Hector Gamez', 'store_manager', '35', 'Grand Prairie 97', true),
('lguerra@conlantire.com', 'Luis Guerra', 'service_manager', '35', 'Grand Prairie 97', true),

-- Tulsa 36
('kbrown@conlantire.com', 'Kenneth Brown', 'store_manager', '36', 'Grand Prairie 97', true),

-- Austin 39
('borozco@conlantire.com', 'Brian Orozco', 'store_manager', '39', 'Grand Prairie 97', true)

ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  store_number = EXCLUDED.store_number,
  plant_code = EXCLUDED.plant_code,
  is_active = EXCLUDED.is_active,
  updated_at = now();