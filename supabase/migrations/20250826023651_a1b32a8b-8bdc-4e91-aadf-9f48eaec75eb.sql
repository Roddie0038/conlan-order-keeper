-- Add test stores for different plants using the existing bigint ID structure
insert into public.stores (store_name, store_number, plant) values
  ('Detroit 041', '041', 'Romulus 098'),
  ('Toledo 042', '042', 'Romulus 098'),
  ('Tampa 051', '051', 'Mulberry 099'),
  ('Orlando 052', '052', 'Mulberry 099');