-- Fix 400 insert failures caused by missing net.http_post
-- 1) Ensure schema and pg_net extension are available
CREATE SCHEMA IF NOT EXISTS net;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA net;

-- 2) Drop existing safe_http_post functions and recreate with proper signatures
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, text, integer);
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, text);

-- Create 3-arg version
CREATE OR REPLACE FUNCTION public.safe_http_post(
  url text,
  headers jsonb DEFAULT '{}'::jsonb,
  body text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, pg_temp
AS $$
DECLARE
  resp jsonb;
BEGIN
  BEGIN
    resp := net.http_post(url := url, headers := headers, body := body);
  EXCEPTION WHEN undefined_function THEN
    -- Extension not available yet
    RETURN jsonb_build_object('status','error','message','net.http_post missing');
  END;
  RETURN resp;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status','error','message',sqlerrm);
END;
$$;

-- Create 4-arg version with timeout
CREATE OR REPLACE FUNCTION public.safe_http_post(
  url text,
  headers jsonb,
  body text,
  timeout_ms integer
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, pg_temp
AS $$
DECLARE
  resp jsonb;
BEGIN
  -- Try 4-arg first if supported by pg_net; otherwise fall back to 3-arg
  BEGIN
    resp := net.http_post(url := url, headers := headers, body := body, timeout_milliseconds := timeout_ms);
  EXCEPTION WHEN undefined_function THEN
    resp := net.http_post(url := url, headers := headers, body := body);
  END;
  RETURN resp;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status','error','message',sqlerrm);
END;
$$;

-- 3) Ensure functions that rely on HTTP have a safe search_path including net
ALTER FUNCTION public.trigger_order_message_notification() SET search_path = public, net, pg_temp;

-- 4) Minimal grants so service role can execute pg_net functions
GRANT USAGE ON SCHEMA net TO postgres, service_role, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA net GRANT EXECUTE ON FUNCTIONS TO postgres, service_role;