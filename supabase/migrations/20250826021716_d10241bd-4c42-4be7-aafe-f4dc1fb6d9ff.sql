-- Create plants table if it doesn't exist
create table if not exists public.plants (
  plant_code text primary key check (plant_code in ('097','098','099')),
  plant_name_normalized text not null unique
);

-- Seed plants with codes in names
insert into public.plants (plant_code, plant_name_normalized) values
  ('097','Grand Prairie 097'),
  ('098','Romulus 098'),
  ('099','Mulberry 099')
on conflict (plant_code) do update set plant_name_normalized = excluded.plant_name_normalized;