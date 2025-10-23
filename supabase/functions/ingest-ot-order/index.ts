import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const ALLOWED_ORIGINS = new Set<string>([
  "https://conlan-order-keeper.lovable.app",
  "http://localhost:5173", // dev
  "http://localhost:3000", // dev
]);

function isAllowedOrigin(origin: string) {
  try {
    const { host } = new URL(origin);
    // Allow known explicit origins and any Lovable preview domains
    return (
      ALLOWED_ORIGINS.has(origin) ||
      host.endsWith('.lovableproject.com') ||
      host.endsWith('.lovable.app') ||
      host === 'localhost:5173' ||
      host === 'localhost:3000'
    );
  } catch {
    return false;
  }
}

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allow = isAllowedOrigin(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

serve(async (req) => {
  const cors = corsHeadersFor(req);

  // 1) Handle CORS preflight
  if (req.method === "OPTIONS") {
    const ok = cors["Access-Control-Allow-Origin"];
    return new Response("ok", { status: ok ? 200 : 403, headers: cors });
  }

  try {
    // 2) Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Extract JWT from Authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('❌ INGEST-OT-ORDER: Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing bearer token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    const userJwt = authHeader.replace('Bearer ', '');
    
    // Create client with user JWT for auth validation
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${userJwt}` } }
    });

    // Verify user session
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser(userJwt);
    
    if (authError || !user) {
      console.error('❌ INGEST-OT-ORDER: Invalid user token:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    console.log(`✅ INGEST-OT-ORDER: Authenticated user: ${user.email} (${user.id})`);

    // 3) Check user role (ot_admin, ot_approver, or ot_viewer)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (roleError) {
      console.error('❌ INGEST-OT-ORDER: Error checking roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify user permissions' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    const userRoles = roles?.map(r => r.role) ?? [];
    const allowedRoles = ['ot_admin', 'ot_approver', 'ot_viewer'];
    const hasRole = userRoles.some(role => allowedRoles.includes(role));

    if (!hasRole) {
      console.error(`❌ INGEST-OT-ORDER: User ${user.email} lacks required role. Has: [${userRoles.join(', ')}]`);
      return new Response(
        JSON.stringify({ error: 'Forbidden: User lacks required role (ot_admin, ot_approver, or ot_viewer)' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    console.log(`✅ INGEST-OT-ORDER: User has role(s): [${userRoles.join(', ')}]`);

    // 4) Parse and validate payload
    const payload: OtOrderPayload = await req.json();
    console.log('📦 INGEST-OT-ORDER: Received payload:', payload);

    if (!payload.product_number || !payload.store || !payload.plant) {
      console.error('❌ INGEST-OT-ORDER: Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: product_number, store, plant' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    // 5) Store-level authorization for non-admins
    const isAdmin = userRoles.includes('ot_admin');
    
    if (!isAdmin) {
      // Non-admin must submit orders only for their assigned store
      const { data: platformUser } = await supabase
        .from('platform_users')
        .select('store, normalized_store')
        .eq('email', user.email)
        .eq('status', 'active')
        .maybeSingle();

      const userStore = platformUser?.normalized_store || platformUser?.store;
      
      if (!userStore) {
        console.error(`❌ INGEST-OT-ORDER: User ${user.email} has no assigned store`);
        return new Response(
          JSON.stringify({ error: 'Forbidden: User has no assigned store' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...cors } }
        );
      }

      if (payload.store !== userStore) {
        console.error(`❌ INGEST-OT-ORDER: User ${user.email} (store: ${userStore}) attempted to submit for store: ${payload.store}`);
        return new Response(
          JSON.stringify({ error: 'Forbidden: Cannot submit orders for other stores' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...cors } }
        );
      }

      console.log(`✅ INGEST-OT-ORDER: Non-admin user ${user.email} authorized for store ${userStore}`);
    }

    // 6) Idempotency check by order_number
    const idempotencyKey = req.headers.get('x-idempotency-key') || payload.order_number;
    
    if (idempotencyKey) {
      const { data: existing, error: checkError } = await supabase
        .from('ot_orders')
        .select('id, created_at, order_number')
        .eq('order_number', idempotencyKey)
        .maybeSingle();

      if (checkError) {
        console.error('❌ INGEST-OT-ORDER: Idempotency check error:', checkError);
      } else if (existing) {
        console.log(`🔁 INGEST-OT-ORDER: Idempotent request for order ${idempotencyKey}, returning existing order ${existing.id}`);
        return new Response(
          JSON.stringify({ 
            id: existing.id, 
            created_at: existing.created_at,
            order_number: existing.order_number,
            idempotent: true
          }),
          { status: 201, headers: { 'Content-Type': 'application/json', ...cors } }
        );
      }
    }

    // 7) Insert new order
    const insertData = {
      id: crypto.randomUUID(),
      order_number: payload.order_number,
      product_number: payload.product_number,
      quantity: payload.quantity,
      store: payload.store,
      plant: payload.plant,
      submitted_by_email: payload.submitted_by_email,
      submitted_by_name: payload.submitted_by_name,
      status: 'pending',
      created_at: new Date().toISOString(),
      metadata: {
        external_id: payload.order_number,
        source: 'ordering_platform',
        submitted_by_user_id: user.id
      }
    };

    console.log('📦 INGEST-OT-ORDER: Inserting into public.ot_orders:', insertData);

    const { data, error } = await supabase
      .from('ot_orders')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ INGEST-OT-ORDER: Database insert error:', error);
      return new Response(
        JSON.stringify({ error: error.message, details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...cors } }
      );
    }

    console.log('✅ INGEST-OT-ORDER: Successfully inserted order:', data.id);

    return new Response(
      JSON.stringify({ 
        id: data.id, 
        created_at: data.created_at,
        order_number: data.order_number 
      }),
      { status: 201, headers: { 'Content-Type': 'application/json', ...cors } }
    );

  } catch (error) {
    console.error('❌ INGEST-OT-ORDER: Unexpected error:', error);
    
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...cors } }
    );
  }
});
