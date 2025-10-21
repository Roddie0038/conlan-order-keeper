-- Cross-dock requests main table
CREATE TABLE IF NOT EXISTS public.cross_dock_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text NOT NULL UNIQUE,
  requesting_store text NOT NULL,
  sending_store text NOT NULL,
  desired_delivery_date date,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  plant text NOT NULL,
  submitted_by_email text,
  submitted_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cross-dock request items (for multi-item requests)
CREATE TABLE IF NOT EXISTS public.cross_dock_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.cross_dock_requests(id) ON DELETE CASCADE,
  product_number text NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Audit log for cross-dock requests
CREATE TABLE IF NOT EXISTS public.cross_dock_request_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.cross_dock_requests(id) ON DELETE CASCADE,
  user_id uuid,
  user_email text,
  action text NOT NULL,
  old_status text,
  new_status text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cross_dock_requests_requesting_store ON public.cross_dock_requests(requesting_store);
CREATE INDEX IF NOT EXISTS idx_cross_dock_requests_sending_store ON public.cross_dock_requests(sending_store);
CREATE INDEX IF NOT EXISTS idx_cross_dock_requests_status ON public.cross_dock_requests(status);
CREATE INDEX IF NOT EXISTS idx_cross_dock_requests_plant ON public.cross_dock_requests(plant);
CREATE INDEX IF NOT EXISTS idx_cross_dock_request_items_request_id ON public.cross_dock_request_items(request_id);
CREATE INDEX IF NOT EXISTS idx_cross_dock_request_audit_request_id ON public.cross_dock_request_audit(request_id);

-- Sequence for request numbers
CREATE SEQUENCE IF NOT EXISTS cross_dock_request_number_seq START 1;

-- Function to generate request number
CREATE OR REPLACE FUNCTION public.generate_cross_dock_request_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  next_num text;
BEGIN
  next_num := 'CDR-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(nextval('cross_dock_request_number_seq')::text, 6, '0');
  RETURN next_num;
END;
$$;

-- Trigger to auto-generate request number
CREATE OR REPLACE FUNCTION public.set_cross_dock_request_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := public.generate_cross_dock_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_cross_dock_request_number
BEFORE INSERT ON public.cross_dock_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_cross_dock_request_number();

-- Trigger to update updated_at
CREATE TRIGGER trigger_cross_dock_requests_updated_at
BEFORE UPDATE ON public.cross_dock_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.cross_dock_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_dock_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cross_dock_request_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cross_dock_requests
-- Users can read requests from their store or plant
CREATE POLICY "Users can read their store/plant requests"
ON public.cross_dock_requests
FOR SELECT
USING (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.platform_users pu
    WHERE pu.email = public.jwt_email()
      AND pu.status = 'active'
      AND (pu.store = cross_dock_requests.requesting_store 
           OR pu.store = cross_dock_requests.sending_store
           OR pu.plant = cross_dock_requests.plant)
  )
);

-- Users can insert requests for their store
CREATE POLICY "Users can create requests for their store"
ON public.cross_dock_requests
FOR INSERT
WITH CHECK (
  public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.platform_users pu
    WHERE pu.email = public.jwt_email()
      AND pu.status = 'active'
      AND pu.store = cross_dock_requests.requesting_store
      AND pu.plant = cross_dock_requests.plant
  )
);

-- Only admins can update requests
CREATE POLICY "Admins can update requests"
ON public.cross_dock_requests
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can delete requests
CREATE POLICY "Admins can delete requests"
ON public.cross_dock_requests
FOR DELETE
USING (public.is_admin());

-- RLS Policies for cross_dock_request_items
-- Users can read items if they can read the parent request
CREATE POLICY "Users can read items for their requests"
ON public.cross_dock_request_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cross_dock_requests cdr
    WHERE cdr.id = cross_dock_request_items.request_id
      AND (
        public.is_admin()
        OR EXISTS (
          SELECT 1 FROM public.platform_users pu
          WHERE pu.email = public.jwt_email()
            AND pu.status = 'active'
            AND (pu.store = cdr.requesting_store 
                 OR pu.store = cdr.sending_store
                 OR pu.plant = cdr.plant)
        )
      )
  )
);

-- Users can insert items for their requests
CREATE POLICY "Users can create items for their requests"
ON public.cross_dock_request_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.cross_dock_requests cdr
    WHERE cdr.id = cross_dock_request_items.request_id
      AND (
        public.is_admin()
        OR EXISTS (
          SELECT 1 FROM public.platform_users pu
          WHERE pu.email = public.jwt_email()
            AND pu.status = 'active'
            AND pu.store = cdr.requesting_store
            AND pu.plant = cdr.plant
        )
      )
  )
);

-- Only admins can update items
CREATE POLICY "Admins can update items"
ON public.cross_dock_request_items
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can delete items
CREATE POLICY "Admins can delete items"
ON public.cross_dock_request_items
FOR DELETE
USING (public.is_admin());

-- RLS Policies for audit log
-- Users can read audit logs for requests they can see
CREATE POLICY "Users can read audit logs for their requests"
ON public.cross_dock_request_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cross_dock_requests cdr
    WHERE cdr.id = cross_dock_request_audit.request_id
      AND (
        public.is_admin()
        OR EXISTS (
          SELECT 1 FROM public.platform_users pu
          WHERE pu.email = public.jwt_email()
            AND pu.status = 'active'
            AND (pu.store = cdr.requesting_store 
                 OR pu.store = cdr.sending_store
                 OR pu.plant = cdr.plant)
        )
      )
  )
);

-- Anyone authenticated can insert audit logs
CREATE POLICY "Authenticated users can create audit logs"
ON public.cross_dock_request_audit
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);