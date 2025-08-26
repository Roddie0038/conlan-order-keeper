-- Add test stores with all required fields
insert into public.stores (store_name, store_number, plant, color, categories, operating_hours, holidays, timezone, locale, notification_prefs) values
  ('Detroit 041', '041', 'Romulus 098', '#FF5722', '{}', '{}', '[]', 'America/Detroit', 'en-US', '{}'),
  ('Toledo 042', '042', 'Romulus 098', '#FF5722', '{}', '{}', '[]', 'America/Detroit', 'en-US', '{}'),
  ('Tampa 051', '051', 'Mulberry 099', '#4CAF50', '{}', '{}', '[]', 'America/New_York', 'en-US', '{}'),
  ('Orlando 052', '052', 'Mulberry 099', '#4CAF50', '{}', '{}', '[]', 'America/New_York', 'en-US', '{}');