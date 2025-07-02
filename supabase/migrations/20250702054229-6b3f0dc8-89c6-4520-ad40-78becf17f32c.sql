-- Insert individual store managers and service managers
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

-- Insert new individual managers
INSERT INTO managers (email, name, role, store_number, plant_code, is_active) VALUES 
-- Fort Worth 22
('jmartinez@conlantire.com', 'Juan Martinez', 'Store Manager', '22', 'Grand Prairie 97', true),

-- Grand Prairie 27
('tosborn@conlantire.com', 'Thomas Osborn', 'Store Manager', '27', 'Grand Prairie 97', true),
('crichard@conlantire.com', 'Cody Richard', 'Service Manager', '27', 'Grand Prairie 97', true),

-- Houston 28
('jhughes@conlantire.com', 'Joshua Hughes', 'Store Manager', '28', 'Grand Prairie 97', true),
('eblais@conlantire.com', 'Eddie Blais', 'Service Manager', '28', 'Grand Prairie 97', true),

-- San Antonio 29
('pvallejo@conlantire.com', 'Patrick Vallejo', 'Store Manager', '29', 'Grand Prairie 97', true),
('rpetty@conlantire.com', 'Ryan Petty', 'Service Manager', '29', 'Grand Prairie 97', true),

-- Oklahoma City 30
('dbaumgardner@conlantire.com', 'Derek Baumgardner', 'Store Manager', '30', 'Grand Prairie 97', true),
('bhunt@conlantire.com', 'Blaine Hunt', 'Service Manager', '30', 'Grand Prairie 97', true),

-- Little Rock 32
('jmilliken@conlantire.com', 'John Milliken', 'Store Manager', '32', 'Grand Prairie 97', true),
('mkaufman@conlantire.com', 'Melvin (Lee) Kaufman', 'Service Manager', '32', 'Grand Prairie 97', true),

-- Kansas City 33
('rjohnson@conlantire.com', 'Robert (Gage) Johnson', 'Store Manager', '33', 'Grand Prairie 97', true),
('lallen@conlantire.com', 'Lauren Allen', 'Service Manager', '33', 'Grand Prairie 97', true),

-- Laredo 35
('hgamez@conlantire.com', 'Hector Gamez', 'Store Manager', '35', 'Grand Prairie 97', true),
('lguerra@conlantire.com', 'Luis Guerra', 'Service Manager', '35', 'Grand Prairie 97', true),

-- Tulsa 36
('kbrown@conlantire.com', 'Kenneth Brown', 'Store Manager', '36', 'Grand Prairie 97', true),

-- Austin 39
('borozco@conlantire.com', 'Brian Orozco', 'Store Manager', '39', 'Grand Prairie 97', true)

ON CONFLICT (email) DO UPDATE SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  store_number = EXCLUDED.store_number,
  plant_code = EXCLUDED.plant_code,
  is_active = EXCLUDED.is_active,
  updated_at = now();