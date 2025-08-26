// supabase/functions/create-regional-order/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

type PlantCode = '097' | '098' | '099';
type OrderType = 'transfer' | 'mto';
type SourceMode = 'PLANT_TO_PLANT' | 'STORE_TO_PLANT';

interface RegionalOrderPayload {
  order_type: OrderType;
  regional_enabled: true;
  destination_store_id: string; // uuid
  source_mode: SourceMode;
  source_plant: PlantCode;
  source_store_id?: string | null;
  transport?: {
    carrier?: string;
    requested_pickup_at?: string | null;
    cross_dock_required?: boolean;
    notes?: string;
  };
  idempotency_key: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TABLES = {
  transfer: "orders",
  mto: "mto_orders",
};

serve(async (req) => {
  console.log('create-regional-order called:', req.method);
  
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    const userClient = createClient(supabaseUrl, anon, { 
      global: { headers: { Authorization: `Bearer ${jwt}` } } 
    });
    const svcClient = createClient(supabaseUrl, svc);

    const body = (await req.json()) as RegionalOrderPayload;
    console.log('Payload received:', body);

    // Shape checks
    if (body.regional_enabled !== true) throw new Error("regional_enabled must be true");
    if (!["transfer","mto"].includes(body.order_type)) throw new Error("invalid order_type");
    if (!["097","098","099"].includes(body.source_plant)) throw new Error("invalid source_plant");
    if (!body.destination_store_id) throw new Error("destination_store_id required");
    if (!body.idempotency_key) throw new Error("idempotency_key required");
    if (body.source_mode === "STORE_TO_PLANT" && !body.source_store_id) throw new Error("source_store_id required");

    // Who's calling?
    const { data: authUserRes } = await userClient.auth.getUser();
    const userId = authUserRes.user?.id;
    if (!userId) return new Response(JSON.stringify({ message: "Unauthorized" }), { 
      status: 401, headers: corsHeaders 
    });

    // Role gate
    const { data: me, error: meErr } = await svcClient
      .from("ot_platform_users")
      .select("id, role, plant, store")
      .eq("auth_user_id", userId)
      .eq("status", "active")
      .single();
    
    if (meErr || !me) {
      console.log('User not found or error:', meErr);
      return new Response(JSON.stringify({ message: "Forbidden" }), { 
        status: 403, headers: corsHeaders 
      });
    }

    const allowedRoles = new Set(["super_admin","warehouse_manager","retread_manager","plant_manager","operations_manager"]);
    if (!allowedRoles.has(me.role)) {
      console.log('Role not allowed:', me.role);
      return new Response(JSON.stringify({ message: "Forbidden" }), { 
        status: 403, headers: corsHeaders 
      });
    }

    // Resolve destination store & plant
    const { data: storeRow, error: storeErr } = await svcClient
      .from("stores")
      .select("id, store_number, store_name, plant")
      .eq("id", body.destination_store_id)
      .single();
    
    if (storeErr || !storeRow) {
      console.log('Store not found:', storeErr);
      throw new Error("Invalid destination_store_id");
    }
    if (["097","098","099"].includes(storeRow.store_number)) throw new Error("Destination cannot be a plant");

    const destination_plant = storeRow.plant as PlantCode;

    // Idempotency check
    const table = TABLES[body.order_type];
    const { data: already } = await svcClient
      .from(table)
      .select("id, order_type, source_plant, destination_plant, destination_store_id")
      .eq("idempotency_key", body.idempotency_key)
      .limit(1);
    
    if (already && already.length > 0) {
      console.log('Idempotency conflict found:', already[0]);
      return new Response(JSON.stringify({ ok: true, conflict: true, order: already[0] }), { 
        status: 409, headers: corsHeaders 
      });
    }

    // Insert payload (align with your tables)
    const insertPayload = {
      order_type: body.order_type, // ensure 'orders' has this column; otherwise remove for that table
      is_regional: true,
      source_plant: body.source_plant,
      destination_plant,
      destination_store_id: body.destination_store_id,
      source_mode: body.source_mode,
      source_store_id: body.source_store_id ?? null,
      idempotency_key: body.idempotency_key,
      transport_carrier: body.transport?.carrier ?? null,
      transport_requested_pickup_at: body.transport?.requested_pickup_at ?? null,
      transport_cross_dock_required: body.transport?.cross_dock_required ?? null,
      transport_notes: body.transport?.notes ?? null,
    };

    console.log('Inserting into table:', table, insertPayload);

    const { data: inserted, error: insErr } = await svcClient
      .from(table)
      .insert(insertPayload)
      .select("id, order_type, source_plant, destination_plant, destination_store_id")
      .single();
    
    if (insErr) {
      console.log('Insert error:', insErr);
      throw insErr;
    }

    console.log('Successfully created order:', inserted);
    return new Response(JSON.stringify({ ok: true, order: inserted }), { 
      status: 200, headers: corsHeaders 
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error('Error:', message);
    return new Response(JSON.stringify({ message }), { 
      status: 400, headers: corsHeaders 
    });
  }
});