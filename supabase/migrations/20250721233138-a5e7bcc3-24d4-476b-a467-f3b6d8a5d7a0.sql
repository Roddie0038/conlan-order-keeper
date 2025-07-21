-- Force update all stores to proper "Store XX" format
UPDATE orders SET store = normalize_store_name(store) WHERE store IS NOT NULL AND store != normalize_store_name(store);
UPDATE mto_orders SET store = normalize_store_name(store) WHERE store IS NOT NULL AND store != normalize_store_name(store);
UPDATE wheel_orders SET store = normalize_store_name(store) WHERE store IS NOT NULL AND store != normalize_store_name(store);
UPDATE warranty_orders SET store = normalize_store_name(store) WHERE store IS NOT NULL AND store != normalize_store_name(store);
UPDATE complaints SET store_number = normalize_store_name(store_number) WHERE store_number IS NOT NULL AND store_number != normalize_store_name(store_number);