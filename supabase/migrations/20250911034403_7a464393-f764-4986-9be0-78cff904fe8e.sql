-- 1) Temporarily disable notification/email triggers on public.orders
ALTER TABLE public.orders DISABLE TRIGGER IF EXISTS trg_notify_orders_status;
ALTER TABLE public.orders DISABLE TRIGGER IF EXISTS trg_order_completed_email;
ALTER TABLE public.orders DISABLE TRIGGER IF EXISTS trg_orders_notify;
ALTER TABLE public.orders DISABLE TRIGGER IF EXISTS trg_orders_oos_email;

-- 2) Create the standardized jsonb-only wrapper (3-arg + optional timeout variant)
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

-- Convenience 3-arg overload that defaults timeout
CREATE OR REPLACE FUNCTION public.safe_http_post(
  url text,
  headers jsonb,
  body jsonb
)
RETURNS jsonb
LANGUAGE sql
AS $$
  SELECT public.safe_http_post(url, headers, body, 3000);
$$;

-- 3) Update functions to use the jsonb-only wrapper (remove ::text casts and legacy timeout args)

-- notify_status_change
CREATE OR REPLACE FUNCTION public.notify_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'net', 'pg_temp'
AS $function$
DECLARE
  v_base   text := 'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller';
  v_int    text;
  v_prev   text;
  v_tbl    text := tg_table_name;
  v_hdrs   jsonb := jsonb_build_object('Content-Type','application/json');
BEGIN
  IF (TG_OP = 'UPDATE' AND (NEW.status IS DISTINCT FROM OLD.status)) THEN
    v_prev := COALESCE(OLD.status, 'unknown');

    BEGIN
      SELECT value INTO v_int FROM public.kv WHERE key = 'internal_token';
      IF v_int IS NOT NULL THEN
        v_hdrs := v_hdrs || jsonb_build_object('x-internal-secret', v_int);
      END IF;
    EXCEPTION WHEN undefined_table THEN NULL; END;

    PERFORM public.safe_http_post(
      url     := v_base,
      headers := v_hdrs,
      body    := jsonb_build_object(
                    'notification_type','status_update',
                    'order_id',   NEW.id::text,
                    'order_type', v_tbl,
                    'store',      NEW.store,
                    'plant',      NEW.plant,
                    'prev_status',v_prev,
                    'status',     NEW.status,
                    'new_status', NEW.status
                 )
    );

    BEGIN
      INSERT INTO public.http_call_logs (
        order_id, order_type, prev_status, new_status, status_code, error_msg, request_id
      ) VALUES (
        NEW.id::text, v_tbl, v_prev, NEW.status, NULL, 'enqueued', NULL
      );
    EXCEPTION WHEN undefined_table THEN NULL; END;
  END IF;

  RETURN NEW;
END
$function$;

-- trgfn_orders_completion_email
CREATE OR REPLACE FUNCTION public.trgfn_orders_completion_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_secret  text;
  enq       jsonb;
  v_req_id  bigint;
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'completed' THEN

    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
      BEGIN
        INSERT INTO public.ordering_email_logs
          (order_type, email_type, order_id, store_number, status, created_at, error_msg)
        VALUES ('orders','completion', NEW.id::text, NEW.store, 'skipped', now(),
                'Missing invoice_number on completed order');
      EXCEPTION WHEN undefined_table THEN NULL; END;
      RETURN NEW;
    END IF;

    BEGIN
      SELECT value INTO v_secret FROM public.app_config WHERE key = 'internal_token';
    EXCEPTION WHEN undefined_table THEN v_secret := NULL; END;

    enq := public.safe_http_post(
      'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller',
      COALESCE(
        jsonb_build_object('Content-Type','application/json') ||
        CASE WHEN v_secret IS NOT NULL THEN jsonb_build_object('x-internal-secret', v_secret)
             ELSE '{}'::jsonb END,
        '{}'::jsonb
      ),
      jsonb_build_object(
        'notification_type','order_completed',
        'order_type','orders',
        'order_id',       NEW.id,
        'store',          COALESCE(NEW.store, ''),
        'plant',          COALESCE(NEW.plant, ''),
        'new_status',     NEW.status,
        'prev_status',    OLD.status,
        'invoice_number', NEW.invoice_number,
        'product_number', NEW.product_number,
        'customer_name',  NEW.name,
        'email',          NEW.email
      )
    );

    v_req_id := NULLIF(enq->>'request_id','')::bigint;

    BEGIN
      INSERT INTO public.ordering_email_logs
        (order_type, email_type, order_id, store_number, status, created_at, request_id)
      VALUES ('orders','completion', NEW.id::text, NEW.store, 'enqueued', now(), v_req_id);
    EXCEPTION WHEN undefined_table THEN NULL; END;
  END IF;

  RETURN NEW;
END
$function$;

-- trgfn_orders_oos_email
CREATE OR REPLACE FUNCTION public.trgfn_orders_oos_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'net'
AS $function$
DECLARE
  v_secret      text;
  v_service_key text;
  v_became_oos  boolean := false;
  v_store_norm  text;
  v_idem        text;
  v_res         jsonb;
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'out_of_stock' THEN
    v_became_oos := true;
  ELSIF (TG_OP = 'UPDATE')
     AND (to_jsonb(OLD)->>'out_of_stock') IS DISTINCT FROM (to_jsonb(NEW)->>'out_of_stock')
     AND (to_jsonb(NEW)->>'out_of_stock') = 'true' THEN
    v_became_oos := true;
  END IF;

  IF v_became_oos THEN
    SELECT value INTO v_secret FROM public.app_config WHERE key = 'internal_token';

    v_service_key := current_setting('app.service_role_key', true);
    v_store_norm := normalize_store_format(NEW.store);
    v_idem := 'ordering_v4:' || NEW.id::text || ':out_of_stock';

    BEGIN
      INSERT INTO public.notification_logs (
        order_id, order_number, order_type, notification_type, recipient_email,
        recipient_role, status, plant, store, platform, metadata
      ) VALUES (
        NEW.id::text,
        NEW.id::text,
        'transfer',
        'out_of_stock',
        COALESCE(NEW.email,'system@conlanorders.com'),
        'store_manager',
        'triggered',
        NEW.plant,
        v_store_norm,
        'ot_platform',
        jsonb_build_object('trigger_source','db_after_update','idempotency_key', v_idem)
      );
    EXCEPTION WHEN OTHERS THEN NULL; END;

    BEGIN
      v_res := public.safe_http_post(
        url := 'https://cdbixtaqjppvdkyfbhkz.functions.supabase.co/notification-controller',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-internal-secret', COALESCE(v_secret, ''),
          'Authorization', 'Bearer ' || COALESCE(v_service_key,'')
        ),
        body := jsonb_build_object(
          'email_type', 'out_of_stock',
          'store_number', v_store_norm,
          'idempotency_key', v_idem,
          'order_id', NEW.id,
          'plant', NEW.plant,
          'out_of_stock_eta', NEW.out_of_stock_eta,
          'out_of_stock_notes', NEW.out_of_stock_notes
        )
      );

      BEGIN
        INSERT INTO public.notification_logs (
          order_id, order_number, order_type, notification_type, recipient_email,
          recipient_role, status, plant, store, platform, metadata
        ) VALUES (
          NEW.id::text,
          NEW.id::text,
          'transfer',
          'out_of_stock',
          COALESCE(NEW.email,'system@conlanorders.com'),
          'store_manager',
          'queued',
          NEW.plant,
          v_store_norm,
          'ot_platform',
          jsonb_build_object('trigger_source','db_after_update','pg_net_status', v_res->>'status', 'idempotency_key', v_idem)
        );
      EXCEPTION WHEN OTHERS THEN NULL; END;

    EXCEPTION WHEN OTHERS THEN
      BEGIN
        INSERT INTO public.notification_logs (
          order_id, order_number, order_type, notification_type, recipient_email,
          recipient_role, status, plant, store, platform, metadata, error_message
        ) VALUES (
          NEW.id::text,
          NEW.id::text,
          'transfer',
          'out_of_stock',
          COALESCE(NEW.email,'system@conlanorders.com'),
          'store_manager',
          'failed_to_queue',
          NEW.plant,
          v_store_norm,
          'ot_platform',
          jsonb_build_object('trigger_source','db_after_update','error_phase','enqueue','idempotency_key', v_idem),
          sqlerrm
        );
      EXCEPTION WHEN OTHERS THEN NULL; END;
    END;
  END IF;

  RETURN NEW;
END;
$function$;

-- trigger_warranty_denied_notification
CREATE OR REPLACE FUNCTION public.trigger_warranty_denied_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_secret text;
  v_idem   text;
  v_store_norm text;
  enq jsonb;
  v_req_id bigint;
BEGIN
  IF TG_OP = 'UPDATE'
     AND (OLD.approval_status IS DISTINCT FROM NEW.approval_status)
     AND NEW.approval_status = 'denied' THEN

    BEGIN
      SELECT value INTO v_secret FROM public.app_config WHERE key = 'internal_token';
    EXCEPTION WHEN OTHERS THEN v_secret := NULL; END;

    v_store_norm := normalize_store_format(NEW.store);
    v_idem := 'ordering_v4:' || NEW.id::text || ':warranty';

    BEGIN
      INSERT INTO public.notification_logs (
        order_id, order_number, order_type, notification_type, recipient_email,
        recipient_role, status, plant, store, platform, metadata
      ) VALUES (
        NEW.id::text,
        NEW.id::text,
        'warranty',
        'warranty',
        COALESCE(NEW.email,'system@conlanorders.com'),
        'store_manager',
        'triggered',
        NEW.plant,
        v_store_norm,
        'ot_platform',
        jsonb_build_object(
          'trigger_source','db_after_update','approval_status','denied','idempotency_key', v_idem
        )
      );
    EXCEPTION WHEN OTHERS THEN NULL; END;

    enq := public.safe_http_post(
      'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller',
      COALESCE(
        jsonb_build_object('Content-Type','application/json') ||
        CASE WHEN v_secret IS NOT NULL THEN jsonb_build_object('x-internal-secret', v_secret) ELSE '{}'::jsonb END,
        '{}'::jsonb
      ),
      jsonb_build_object(
        'email_type', 'warranty',
        'store_number', v_store_norm,
        'idempotency_key', v_idem,
        'order_id', NEW.id,
        'plant', NEW.plant,
        'approval_status', NEW.approval_status,
        'denial_reason', NEW.denial_reason
      )
    );

    v_req_id := NULLIF(enq->>'request_id','')::bigint;

    BEGIN
      INSERT INTO public.notification_logs (
        order_id, order_number, order_type, notification_type, recipient_email,
        recipient_role, status, plant, store, platform, metadata
      ) VALUES (
        NEW.id::text,
        NEW.id::text,
        'warranty',
        'warranty',
        COALESCE(NEW.email,'system@conlanorders.com'),
        'store_manager',
        'queued',
        NEW.plant,
        v_store_norm,
        'ot_platform',
        jsonb_build_object('trigger_source','db_after_update','request_id', v_req_id, 'idempotency_key', v_idem)
      );
    EXCEPTION WHEN OTHERS THEN NULL; END;

    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$function$;

-- trigger_warranty_completion_email
CREATE OR REPLACE FUNCTION public.trigger_warranty_completion_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF (OLD.approval_status IS DISTINCT FROM NEW.approval_status) AND NEW.approval_status = 'approved' THEN
    INSERT INTO public.ordering_email_logs (order_type, email_type, order_id, store_number, status, created_at)
    VALUES ('warranty', 'warranty', NEW.id::text, NEW.store, 'triggered', NOW());

    PERFORM public.safe_http_post(
      url := 'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/warranty-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(current_setting('request.jwt.claims', true)::json->>'token', current_setting('app.service_role_key', true))
      ),
      body := jsonb_build_object(
        'orderId', NEW.id,
        'orderType', 'warranty',
        'store', NEW.store,
        'emailType', 'warranty'
      )
    );
  END IF;
  RETURN NEW;
END;
$function$;

-- 4) Drop legacy overloads that accepted TEXT headers/body
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, text);
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, text, integer);
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb DEFAULT '{}'::jsonb, text DEFAULT NULL::text, integer DEFAULT 3000);
DROP FUNCTION IF EXISTS public.safe_http_post(text, jsonb, jsonb, integer) CASCADE; -- will be recreated immediately above

-- Recreate the canonical wrapper again to ensure it's present after cleanup
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

CREATE OR REPLACE FUNCTION public.safe_http_post(
  url text,
  headers jsonb,
  body jsonb
)
RETURNS jsonb
LANGUAGE sql
AS $$
  SELECT public.safe_http_post(url, headers, body, 3000);
$$;

-- 5) Re-enable the notification/email triggers on public.orders
ALTER TABLE public.orders ENABLE TRIGGER IF EXISTS trg_notify_orders_status;
ALTER TABLE public.orders ENABLE TRIGGER IF EXISTS trg_order_completed_email;
ALTER TABLE public.orders ENABLE TRIGGER IF EXISTS trg_orders_notify;
ALTER TABLE public.orders ENABLE TRIGGER IF EXISTS trg_orders_oos_email;
