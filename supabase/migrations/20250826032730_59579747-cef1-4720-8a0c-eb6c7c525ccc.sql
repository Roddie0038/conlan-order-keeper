-- Resolve order_drafts upsert errors (ON CONFLICT requires a non-partial unique constraint)
-- 1) De-duplicate existing draft_key rows to allow adding a full unique constraint
WITH dups AS (
  SELECT id, draft_key, row_number() OVER (PARTITION BY draft_key ORDER BY updated_at DESC) AS rn
  FROM public.order_drafts
)
UPDATE public.order_drafts od
SET draft_key = od.draft_key || ':archived:' || od.id::text
FROM dups
WHERE od.id = dups.id AND dups.rn > 1;

-- 2) Drop partial unique indexes that Postgres can't infer in ON CONFLICT
DROP INDEX IF EXISTS public.uq_order_drafts_draft_key_active;
DROP INDEX IF EXISTS public.idx_order_drafts_unique_active_key;

-- 3) Add a proper unique constraint usable by ON CONFLICT
ALTER TABLE public.order_drafts
ADD CONSTRAINT order_drafts_draft_key_unique UNIQUE (draft_key);
