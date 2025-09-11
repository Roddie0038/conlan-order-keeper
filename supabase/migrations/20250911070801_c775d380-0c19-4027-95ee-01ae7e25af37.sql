-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create compatibility function for net.http_post(text,jsonb,text)
CREATE OR REPLACE FUNCTION net.http_post(url text, headers jsonb, body text)
RETURNS jsonb
LANGUAGE plpgsql
AS $func$
DECLARE
  body_json jsonb;
BEGIN
  body_json := CASE WHEN body IS NULL OR body = '' THEN '{}'::jsonb ELSE to_jsonb(body) END;
  RETURN net.http_post(
    url := url,
    body := body_json,
    params := '{}'::jsonb,
    headers := headers,
    timeout_milliseconds := 3000
  );
END;
$func$;