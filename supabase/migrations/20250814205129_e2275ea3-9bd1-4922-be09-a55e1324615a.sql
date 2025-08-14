-- PHASE 1: Additive columns for cross-plant ordering (idempotent)

-- ORDERS
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS ordering_store text,
  ADD COLUMN IF NOT EXISTS ordering_plant text,
  ADD COLUMN IF NOT EXISTS destination_plant text;

-- MTO ORDERS
ALTER TABLE public.mto_orders
  ADD COLUMN IF NOT EXISTS ordering_store text,
  ADD COLUMN IF NOT EXISTS ordering_plant text,
  ADD COLUMN IF NOT EXISTS destination_plant text;