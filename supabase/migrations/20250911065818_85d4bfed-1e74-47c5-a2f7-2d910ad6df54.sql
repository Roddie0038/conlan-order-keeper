-- Ensure required schema and extension for outbound HTTP exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'net') THEN
    EXECUTE 'CREATE SCHEMA net';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    EXECUTE 'CREATE EXTENSION pg_net';
  END IF;
END $$;

-- Provide a compatibility shim for legacy callers that pass body as TEXT
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'net'
      AND p.proname = 'http_post'
      AND p.proargtypes = ARRAY[25::oid, 3802::oid, 25::oid]::oidvector  -- (text, jsonb, text)
  ) THEN
    EXECUTE $$
      CREATE FUNCTION net.http_post(url text, headers jsonb, body text)
      RETURNS jsonb
      LANGUAGE plpgsql
      AS $$
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
      $$
    $$;
  END IF;
END $$;
