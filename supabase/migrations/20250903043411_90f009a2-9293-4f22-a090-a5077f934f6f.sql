-- 0) Ensure extension for UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Idempotency table (no RLS for simplicity & reliability)
CREATE TABLE IF NOT EXISTS public.notification_idempotency (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key   text NOT NULL UNIQUE,
  created_at        timestamptz NOT NULL DEFAULT now(),
  processed_at      timestamptz,
  status            text NOT NULL DEFAULT 'processed',
  metadata          jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (status IN ('processed','already_processed','failed'))
);

-- Ensure RLS is disabled to avoid blocking server-side controller writes
ALTER TABLE public.notification_idempotency DISABLE ROW LEVEL SECURITY;

-- 2) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_notification_idempotency_created_at
  ON public.notification_idempotency (created_at);