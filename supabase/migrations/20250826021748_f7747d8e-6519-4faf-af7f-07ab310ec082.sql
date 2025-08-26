-- Enable RLS on plants table and add basic policy
alter table public.plants enable row level security;

create policy "Plants are viewable by everyone" 
on public.plants 
for select 
using (true);

-- Update constraints for real schema (store_name not store_name_normalized)
create or replace function public.store_name_conflicts_with_plant_real(_name text)
returns boolean language sql stable as $$
  select exists(select 1 from public.plants p where p.plant_name_normalized = _name)
$$;

-- Add constraint to prevent store names equal to any plant name
do $$
begin
  if not exists (select 1 from pg_constraint where conname='stores_name_not_equal_plant_real') then
    alter table public.stores
      add constraint stores_name_not_equal_plant_real
      check (public.store_name_conflicts_with_plant_real(store_name) = false) not valid;
    alter table public.stores validate constraint stores_name_not_equal_plant_real;
  end if;
end$$;

-- Add suffix guard on store_name (blocks "...097/098/099")
do $$
begin
  if not exists (select 1 from pg_constraint where conname='stores_name_not_end_with_plantcode_real') then
    alter table public.stores
      add constraint stores_name_not_end_with_plantcode_real
      check (right(store_name,3) not in ('097','098','099')) not valid;
    alter table public.stores validate constraint stores_name_not_end_with_plantcode_real;
  end if;
end$$;