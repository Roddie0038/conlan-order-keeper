-- First, let's fix the stores table to use UUID and add some test stores for different plants
-- Change stores.id to UUID (this will update foreign key references too)
alter table public.stores alter column id set data type uuid using gen_random_uuid();

-- Add some test stores for Romulus 098 and Mulberry 099 plants
insert into public.stores (id, store_name, store_number, plant) values
  (gen_random_uuid(), 'Detroit 041', '041', 'Romulus 098'),
  (gen_random_uuid(), 'Toledo 042', '042', 'Romulus 098'),
  (gen_random_uuid(), 'Tampa 051', '051', 'Mulberry 099'),
  (gen_random_uuid(), 'Orlando 052', '052', 'Mulberry 099');