-- Cross-plant ordering audit table
CREATE TABLE IF NOT EXISTS public.order_crossplant_audit (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  order_type TEXT NOT NULL CHECK (order_type IN ('order','mto')),
  order_id BIGINT,
  user_email TEXT,
  user_role TEXT,
  ordering_store TEXT,        -- e.g., "Grand Prairie 027"
  ordering_plant TEXT,        -- e.g., "Grand Prairie 097"
  destination_plant TEXT,     -- e.g., "Mulberry 099"
  destination_store TEXT,     -- legacy 'store' at time of submit
  meta JSONB                  -- room for extras (ip, ua, etc.)
);

-- RLS (keep CLOSED by default; service calls can write)
ALTER TABLE public.order_crossplant_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.order_crossplant_audit FROM anon, authenticated, public;