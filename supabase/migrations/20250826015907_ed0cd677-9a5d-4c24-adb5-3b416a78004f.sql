DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname='stores_store_number_format') THEN
    EXECUTE $$comment on constraint stores_store_number_format on public.stores is 'Store numbers must be 3 digits (not plant codes)'$$;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname='stores_name_not_end_with_plantcode') THEN
    EXECUTE $$comment on constraint stores_name_not_end_with_plantcode on public.stores is 'Prevent store names ending with plant codes 097/098/099'$$;
  END IF;
END$$;