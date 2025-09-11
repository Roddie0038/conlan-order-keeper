-- Update HTTP notification functions to use public.safe_http_post

-- Update notify_controller_http function
CREATE OR REPLACE FUNCTION notify_controller_http(p_order_type text, p_store_number text, p_plant text DEFAULT NULL, p_idempotency_key text DEFAULT NULL, p_source text DEFAULT NULL, p_payload jsonb DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
DECLARE
  v_url text := 'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller';
  v_auth text := current_setting('app.service_role_key', true);
  hdrs jsonb;
  payload_text text;
  resp jsonb;
BEGIN
  IF p_order_type IS NULL OR p_store_number IS NULL THEN
    RAISE EXCEPTION 'notify_controller_http: order_type and store_number are required';
  END IF;

  hdrs := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', CASE WHEN v_auth IS NULL THEN NULL ELSE 'Bearer ' || v_auth END
  );

  payload_text := jsonb_build_object(
    'order_type', p_order_type,
    'store_number', p_store_number,
    'plant', p_plant,
    'idempotency_key', p_idempotency_key,
    'source', p_source,
    'payload', p_payload
  )::text;

  -- Never raise on HTTP; function must not fail
  resp := public.safe_http_post(v_url, hdrs, payload_text, 5000);
END;
$fn$;

-- Update trg_orders_notify function (it uses notify_controller_http, so it's already using safe_http_post indirectly)
CREATE OR REPLACE FUNCTION trg_orders_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
BEGIN
  PERFORM notify_controller_http(
    p_order_type    => 'transfer',
    p_store_number  => NEW.store,
    p_plant         => NEW.plant,
    p_payload       => jsonb_build_object(
      'order_id', NEW.id,
      'store_name', NEW.store,
      'submitted_by_name', NEW.full_name,
      'submitted_by_email', NEW.email,
      'product_number', NEW.product_number,
      'quantity', NEW.quantity,
      'description', NEW.description,
      'notes', NEW.notes,
      'timestamp', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );
  RETURN NEW;
END;
$fn$;

-- Update trigger_notify_order_update function
CREATE OR REPLACE FUNCTION trigger_notify_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
DECLARE
  v_url text := 'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller';
  v_secret text;
  v_store_norm text;
  v_idem text;
  hdrs jsonb;
  payload_text text;
  resp jsonb;
  v_req_id bigint;
BEGIN
  -- Get internal secret if available
  BEGIN
    SELECT value INTO v_secret FROM public.app_config WHERE key = 'internal_token';
  EXCEPTION WHEN OTHERS THEN
    v_secret := NULL;
  END;

  v_store_norm := normalize_store_format(NEW.store);
  v_idem := 'ordering_v4:' || NEW.id::text || ':message';

  -- Canonical log: triggered
  BEGIN
    INSERT INTO public.notification_logs (
      order_id, order_number, order_type, notification_type, recipient_email,
      recipient_role, status, plant, store, platform, metadata
    ) VALUES (
      NEW.id::text,
      NEW.id::text,
      COALESCE(TG_TABLE_NAME, 'orders'),
      'message',
      COALESCE(NEW.email, 'system@conlanorders.com'),
      'store_manager',
      'triggered',
      NEW.plant,
      v_store_norm,
      'ot_platform',
      jsonb_build_object(
        'trigger_source','db_after_update',
        'prev_status', COALESCE(OLD.status, ''),
        'new_status', COALESCE(NEW.status, ''),
        'idempotency_key', v_idem
      )
    );
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Post to controller via safe_http_post
  hdrs := jsonb_build_object('Content-Type','application/json');
  IF v_secret IS NOT NULL THEN
    hdrs := hdrs || jsonb_build_object('x-internal-secret', v_secret);
  END IF;

  payload_text := jsonb_build_object(
    'email_type', 'message',
    'store_number', v_store_norm,
    'idempotency_key', v_idem,
    'order_id', NEW.id,
    'plant', NEW.plant
  )::text;

  resp := public.safe_http_post(v_url, hdrs, payload_text, 3000);
  v_req_id := NULLIF(resp->>'request_id','')::bigint;

  -- Log enqueue (fire-and-forget)
  BEGIN
    INSERT INTO public.notification_logs (
      order_id, order_number, order_type, notification_type, recipient_email,
      recipient_role, status, plant, store, platform, metadata
    ) VALUES (
      NEW.id::text,
      NEW.id::text,
      COALESCE(TG_TABLE_NAME, 'orders'),
      'message',
      COALESCE(NEW.email, 'system@conlanorders.com'),
      'store_manager',
      'queued',
      NEW.plant,
      v_store_norm,
      'ot_platform',
      jsonb_build_object('request_id', v_req_id, 'idempotency_key', v_idem)
    );
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN NEW;
END;
$fn$;

-- Update trigger_cross_dock_notification function
CREATE OR REPLACE FUNCTION trigger_cross_dock_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
DECLARE
  hdrs jsonb;
  payload_text text;
  resp jsonb;
BEGIN
  IF NEW.cross_plant_order = true AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.ordering_email_logs (order_type, email_type, order_id, store_number, status, created_at)
    VALUES ('transfer', 'cross_dock', NEW.id::text, NEW.store, 'triggered', NOW());
    
    hdrs := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    );

    payload_text := jsonb_build_object(
      'orderRecord', jsonb_build_object(
        'id', NEW.id,
        'store', NEW.store,
        'plant', NEW.plant,
        'email', NEW.email,
        'name', NEW.name,
        'product_number', NEW.product_number,
        'description', NEW.description,
        'quantity', NEW.quantity,
        'cross_dock_destination', NEW.cross_dock_destination,
        'cross_dock_eta_date', NEW.cross_dock_eta_date,
        'cross_dock_type', NEW.cross_dock_type,
        'status', NEW.status,
        'timestamp', NEW.timestamp
      )
    )::text;

    resp := public.safe_http_post(
      'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/send-cross-dock-notification',
      hdrs,
      payload_text,
      5000
    );
  END IF;
  RETURN NEW;
END;
$fn$;

-- Update trigger_complaint_notification function
CREATE OR REPLACE FUNCTION trigger_complaint_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
DECLARE
  hdrs jsonb;
  payload_text text;
  resp jsonb;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'Open' THEN
    INSERT INTO public.ordering_email_logs (order_type, email_type, order_id, store_number, status, created_at)
    VALUES ('complaint', 'customer_complaints', NEW.id::text, NEW.store_number, 'triggered', NOW());
    
    hdrs := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(current_setting('request.jwt.claims', true)::json->>'token', current_setting('app.service_role_key', true))
    );

    payload_text := jsonb_build_object(
      'complaintId', NEW.id,
      'orderType', 'complaint',
      'store', NEW.store_number,
      'emailType', 'customer_complaints'
    )::text;

    resp := public.safe_http_post(
      'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/send-customer-complaint-notification',
      hdrs,
      payload_text,
      5000
    );
  END IF;
  RETURN NEW;
END;
$fn$;

-- Update trigger_warranty_completion_email function
CREATE OR REPLACE FUNCTION trigger_warranty_completion_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
DECLARE
  hdrs jsonb;
  payload_text text;
  resp jsonb;
BEGIN
  IF (OLD.approval_status IS DISTINCT FROM NEW.approval_status) AND NEW.approval_status = 'approved' THEN
    INSERT INTO public.ordering_email_logs (order_type, email_type, order_id, store_number, status, created_at)
    VALUES ('warranty', 'warranty', NEW.id::text, NEW.store, 'triggered', NOW());
    
    hdrs := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(current_setting('request.jwt.claims', true)::json->>'token', current_setting('app.service_role_key', true))
    );

    payload_text := jsonb_build_object(
      'orderId', NEW.id,
      'orderType', 'warranty',
      'store', NEW.store,
      'emailType', 'warranty'
    )::text;

    resp := public.safe_http_post(
      'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/warranty-notification',
      hdrs,
      payload_text,
      5000
    );
  END IF;
  RETURN NEW;
END;
$fn$;

-- Update trigger_warranty_denied_notification function
CREATE OR REPLACE FUNCTION trigger_warranty_denied_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
DECLARE
  v_secret text;
  v_idem text;
  v_store_norm text;
  hdrs jsonb;
  payload_text text;
  resp jsonb;
  v_req_id bigint;
BEGIN
  IF TG_OP = 'UPDATE'
     AND (OLD.approval_status IS DISTINCT FROM NEW.approval_status)
     AND NEW.approval_status = 'denied' THEN

    -- Read the internal secret from app_config
    BEGIN
      SELECT value INTO v_secret FROM public.app_config WHERE key = 'internal_token';
    EXCEPTION WHEN OTHERS THEN
      v_secret := NULL;
    END;

    v_store_norm := normalize_store_format(NEW.store);
    v_idem := 'ordering_v4:' || NEW.id::text || ':warranty';

    -- Canonical log: triggered
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

    -- Async call to controller via safe_http_post
    hdrs := jsonb_build_object('Content-Type','application/json');
    IF v_secret IS NOT NULL THEN
      hdrs := hdrs || jsonb_build_object('x-internal-secret', v_secret);
    END IF;

    payload_text := jsonb_build_object(
      'email_type', 'warranty',
      'store_number', v_store_norm,
      'idempotency_key', v_idem,
      'order_id', NEW.id,
      'plant', NEW.plant,
      'approval_status', NEW.approval_status,
      'denial_reason', NEW.denial_reason
    )::text;

    resp := public.safe_http_post(
      'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller',
      hdrs,
      payload_text,
      3000
    );

    v_req_id := NULLIF(resp->>'request_id','')::bigint;

    -- Success path: log queued
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
  END IF;

  RETURN NEW;
END;
$fn$;

-- Update trigger_wheel_received_notification_controller function
CREATE OR REPLACE FUNCTION trigger_wheel_received_notification_controller()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
DECLARE
  hdrs jsonb;
  payload_text text;
  resp jsonb;
BEGIN
  -- only fire on status change to 'received'
  IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'received' THEN
    -- log it
    INSERT INTO public.ordering_email_logs (
      order_type, email_type, order_id, store_number, status, created_at
    )
    VALUES (
      'wheel',
      'wheel_order_received',
      NEW.id::text,
      NEW.store,
      'triggered',
      NOW()
    );

    -- send to Notification Controller via safe_http_post
    hdrs := jsonb_build_object(
      'Content-Type','application/json',
      'Authorization','Bearer ' || current_setting('app.service_role_key', true)
    );

    payload_text := jsonb_build_object(
      'event','wheel_order_received',
      'order_type','wheel',
      'order_id',NEW.id,
      'plant',NEW.plant,
      'store',NEW.store
    )::text;

    resp := public.safe_http_post(
      'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller',
      hdrs,
      payload_text,
      5000
    );
  END IF;
  RETURN NEW;
END;
$fn$;

-- Update notify_status_change function
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, extensions, pg_temp
AS $fn$
DECLARE
  v_base   text := 'https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/notification-controller';
  v_int    text;
  v_prev   text;
  v_tbl    text := tg_table_name;
  v_hdrs   jsonb := jsonb_build_object('Content-Type','application/json');
  payload_text text;
  resp jsonb;
BEGIN
  IF (TG_OP = 'UPDATE' AND (NEW.status IS DISTINCT FROM OLD.status)) THEN
    v_prev := COALESCE(OLD.status, 'unknown');

    BEGIN
      SELECT value INTO v_int FROM public.kv WHERE key = 'internal_token';
      IF v_int IS NOT NULL THEN
        v_hdrs := v_hdrs || jsonb_build_object('x-internal-secret', v_int);
      END IF;
    EXCEPTION WHEN undefined_table THEN NULL; END;

    payload_text := jsonb_build_object(
      'notification_type','status_update',
      'order_id',   NEW.id::text,
      'order_type', v_tbl,
      'store',      NEW.store,
      'plant',      NEW.plant,
      'prev_status',v_prev,
      'status',     NEW.status,
      'new_status', NEW.status
    )::text;

    resp := public.safe_http_post(v_base, v_hdrs, payload_text, 5000);

    BEGIN
      INSERT INTO public.http_call_logs (
        order_id, order_type, prev_status, new_status, status_code, error_msg, request_id
      ) VALUES (
        NEW.id::text, v_tbl, v_prev, NEW.status, NULL, 'enqueued', NULL
      );
    EXCEPTION WHEN undefined_table THEN NULL; END;
  END IF;

  RETURN NEW;
END;
$fn$;