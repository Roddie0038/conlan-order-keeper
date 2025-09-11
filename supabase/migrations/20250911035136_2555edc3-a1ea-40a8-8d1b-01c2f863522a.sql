-- First drop the existing safe_http_post functions 
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, text);
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, text, integer);
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, jsonb, integer);
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, jsonb);

-- Now create the standardized jsonb-only wrapper
CREATE OR REPLACE FUNCTION public.safe_http_post(
  url text,
  headers jsonb,
  body jsonb,
  timeout_ms integer DEFAULT 3000
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'net', 'pg_temp'
AS $$
DECLARE
  resp jsonb;
BEGIN
  resp := net.http_post(
    url,
    body,
    '{}'::jsonb,
    COALESCE(headers, '{}'::jsonb),
    timeout_ms
  );
  RETURN resp;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('status','error','message',sqlerrm);
END;
$$;

-- Test the safe_http_post function to confirm it's working
SELECT public.safe_http_post(
  'https://httpbin.org/post',
  '{"Content-Type": "application/json"}'::jsonb,
  '{"test": "data"}'::jsonb
) AS test_result;