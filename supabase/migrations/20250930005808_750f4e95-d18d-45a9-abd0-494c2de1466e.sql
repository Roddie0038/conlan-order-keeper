-- Add idempotency_key column and unique constraint for duplicate prevention
ALTER TABLE public.mto_orders 
  ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Create unique index for idempotency (allows NULL values but ensures uniqueness when present)
CREATE UNIQUE INDEX IF NOT EXISTS idx_mto_orders_idempotency_key 
ON public.mto_orders (idempotency_key) 
WHERE idempotency_key IS NOT NULL;