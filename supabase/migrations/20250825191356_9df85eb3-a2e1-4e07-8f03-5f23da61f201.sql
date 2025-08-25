-- Order Drafts schema adjustments: reusable draft_key, aligned form_type/subtype, safer policies, and indexes

-- 1) Ensure table exists with the desired shape (no global UNIQUE, no strict CHECK)
CREATE TABLE IF NOT EXISTS public.order_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_key text NOT NULL,
  form_type text NOT NULL,
  subtype text NOT NULL DEFAULT 'transfer',
  store text NOT NULL,
  plant text NOT NULL,
  author_user_id uuid NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted boolean NOT NULL DEFAULT false
);

-- 2) Enable RLS
ALTER TABLE public.order_drafts ENABLE ROW LEVEL SECURITY;

-- 3) Drop any existing global UNIQUE constraint on draft_key if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.order_drafts'::regclass
      AND conname = 'order_drafts_draft_key_key'
  ) THEN
    ALTER TABLE public.order_drafts DROP CONSTRAINT order_drafts_draft_key_key;
  END IF;
END$$;

-- 4) Remove strict CHECK constraints on form_type if any (we'll enforce in app layer)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'order_drafts'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) ILIKE '%form_type%'
  ) LOOP
    EXECUTE format('ALTER TABLE public.order_drafts DROP CONSTRAINT %I', r.conname);
  END LOOP;
END$$;

-- 5) Ensure subtype default is 'transfer'
ALTER TABLE public.order_drafts
  ALTER COLUMN subtype SET DEFAULT 'transfer';

-- 6) Create a partial UNIQUE index so only active (unsubmitted) drafts must be unique by key
CREATE UNIQUE INDEX IF NOT EXISTS uq_order_drafts_draft_key_active
  ON public.order_drafts(draft_key)
  WHERE submitted = false;

-- 7) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_order_drafts_author ON public.order_drafts(author_user_id);
CREATE INDEX IF NOT EXISTS idx_order_drafts_updated_at ON public.order_drafts(updated_at);
CREATE INDEX IF NOT EXISTS idx_order_drafts_lookup
  ON public.order_drafts(draft_key, submitted, updated_at DESC);

-- 8) Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_order_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger idempotently
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_order_drafts_updated_at'
      AND tgrelid = 'public.order_drafts'::regclass
  ) THEN
    DROP TRIGGER trigger_order_drafts_updated_at ON public.order_drafts;
  END IF;
  CREATE TRIGGER trigger_order_drafts_updated_at
    BEFORE UPDATE ON public.order_drafts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_order_drafts_updated_at();
END$$;

-- 9) RLS Policies: ensure select/insert/update; omit delete for auditability
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_drafts' AND policyname = 'drafts_select_own_unsubmitted'
  ) THEN
    CREATE POLICY "drafts_select_own_unsubmitted"
    ON public.order_drafts FOR SELECT
    USING (author_user_id = auth.uid() AND submitted = false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_drafts' AND policyname = 'drafts_insert_own_unsubmitted'
  ) THEN
    CREATE POLICY "drafts_insert_own_unsubmitted"
    ON public.order_drafts FOR INSERT
    WITH CHECK (author_user_id = auth.uid() AND submitted = false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_drafts' AND policyname = 'drafts_update_own'
  ) THEN
    CREATE POLICY "drafts_update_own"
    ON public.order_drafts FOR UPDATE
    USING (author_user_id = auth.uid())
    WITH CHECK (author_user_id = auth.uid());
  END IF;
END$$;

-- 10) Remove prior delete policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_drafts' AND policyname = 'drafts_delete_own'
  ) THEN
    DROP POLICY "drafts_delete_own" ON public.order_drafts;
  END IF;
END$$;