-- Align safe_http_post with available pg_net signature (url, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer)
-- Create overloads to support existing callers

-- Drop existing variants to avoid signature conflicts
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, text, integer);
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, text);

-- 1) 3-arg variant with JSONB body (preferred)
CREATE OR REPLACE FUNCTION public.safe_http_post(
  url text,
  headers jsonb,
  body jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, pg_temp
AS $$
DECLARE
  resp jsonb;
BEGIN
  BEGIN
    resp := net.http_post(
      url := url,
      body := COALESCE(body, '{}'::jsonb),
      params := '{}'::jsonb,
      headers := COALESCE(headers, '{}'::jsonb),
      timeout_milliseconds := 3000
    );
  EXCEPTION WHEN undefined_function THEN
    -- Fallback to any older variant if present
    BEGIN
      resp := net.http_post(url := url, headers := headers, body := COALESCE(body, '{}'::jsonb));
    EXCEPTION WHEN undefined_function THEN
      RETURN jsonb_build_object('status','error','message','pg_net http_post variants missing');
    END;
  END;
  RETURN resp;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status','error','message',sqlerrm);
END;
$$;

-- 2) 3-arg variant with TEXT body (existing callers)
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
  body_json jsonb;
BEGIN
  body_json := CASE WHEN body IS NULL OR body = '' THEN '{}'::jsonb ELSE to_jsonb(body) END;
  BEGIN
    resp := net.http_post(
      url := url,
      body := body_json,
      params := '{}'::jsonb,
      headers := COALESCE(headers, '{}'::jsonb),
      timeout_milliseconds := 3000
    );
  EXCEPTION WHEN undefined_function THEN
    BEGIN
      resp := net.http_post(url := url, headers := headers, body := body_json);
    EXCEPTION WHEN undefined_function THEN
      RETURN jsonb_build_object('status','error','message','pg_net http_post variants missing');
    END;
  END;
  RETURN resp;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status','error','message',sqlerrm);
END;
$$;

-- 3) 4-arg variant with explicit timeout
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
  body_json jsonb;
BEGIN
  body_json := CASE WHEN body IS NULL OR body = '' THEN '{}'::jsonb ELSE to_jsonb(body) END;
  BEGIN
    resp := net.http_post(
      url := url,
      body := body_json,
      params := '{}'::jsonb,
      headers := COALESCE(headers, '{}'::jsonb),
      timeout_milliseconds := COALESCE(timeout_ms, 3000)
    );
  EXCEPTION WHEN undefined_function THEN
    BEGIN
      resp := net.http_post(url := url, headers := headers, body := body_json);
    EXCEPTION WHEN undefined_function THEN
      RETURN jsonb_build_object('status','error','message','pg_net http_post variants missing');
    END;
  END;
  RETURN resp;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status','error','message',sqlerrm);
END;
$$;

-- Ensure relevant functions keep safe search_path
DO $$
BEGIN
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_order_message_notification() SET search_path = public, net, pg_temp'; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_notify_order_update() SET search_path = public, net, pg_temp'; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_cross_dock_notification() SET search_path = public, net, pg_temp'; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_warranty_denied_notification() SET search_path = public, net, pg_temp'; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_warranty_completion_email() SET search_path = public, net, pg_temp'; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_mto_email_notification_v2() SET search_path = public, net, pg_temp'; EXCEPTION WHEN undefined_function THEN NULL; END;
  BEGIN EXECUTE 'ALTER FUNCTION public.trigger_mto_email_notification_v3() SET search_path = public, net, pg_temp'; EXCEPTION WHEN undefined_function THEN NULL; END;
END $$;