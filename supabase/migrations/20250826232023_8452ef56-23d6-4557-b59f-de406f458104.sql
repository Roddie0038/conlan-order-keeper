-- Add quantity constraint to ensure positive values
ALTER TABLE public.orders
  ADD CONSTRAINT orders_quantity_positive
  CHECK ((quantity)::int > 0);