import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

type PlantCode = '097' | '098' | '099';
type OrderType = 'transfer' | 'mto';
type SourceMode = 'PLANT_TO_PLANT' | 'STORE_TO_PLANT';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toPlantCode(value: unknown): '097'|'098'|'099' {
  const s = String(value ?? '').trim();
  if (['097','098','099'].includes(s)) return s as any;
  const m = s.match(/(\d{3})$/);
  if (m && ['097','098','099'].includes(m[1])) return m[1] as any;
  throw new Error('invalid plant code');
}

function toBigintId(v: unknown): number {
  if (typeof v === 'number' && Number.isInteger(v) && v > 0) return v;
  if (typeof v === 'string' && v.trim() !== '' && /^\d+$/.test(v)) {
    const n = Number(v);
    if (Number.isInteger(n) && n > 0) return n;
  }
  throw new Error('invalid store id');
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    const userClient = createClient(supabaseUrl, anon, { global: { headers: { Authorization: `Bearer ${jwt}` } } });
    const svcClient  = createClient(supabaseUrl, svc);

    const body = await req.json();

    // Phase 1: Simple payload format
    const { origin_ot_id, destination_ot_id, destination_kind, product_number, quantity, notes, idempotency_key } = body;

    if (!origin_ot_id || !destination_ot_id || !destination_kind) {
      throw new Error("origin_ot_id, destination_ot_id, and destination_kind are required");
    }

    if (!product_number || !quantity) {
      throw new Error("product_number and quantity are required");
    }

    // Convert ot_id format to plant/store lookup
    const { data: originPlant } = await svcClient
      .from("app_plants")
      .select("code, city")
      .eq("ot_id", origin_ot_id)
      .eq("active", true)
      .single();

    if (!originPlant) throw new Error(`Invalid origin plant: ${origin_ot_id}`);

    let destination_store_id: number | null = null;
    let destination_plant: string;

    if (destination_kind === 'store') {
      const { data: destStore } = await svcClient
        .from("app_stores")
        .select("store_code, city, id")
        .eq("ot_id", destination_ot_id)
        .eq("active", true)
        .single();

      if (!destStore) throw new Error(`Invalid destination store: ${destination_ot_id}`);
      
      destination_store_id = destStore.id;
      destination_plant = originPlant.code;
    } else {
      const { data: destPlant } = await svcClient
        .from("app_plants")
        .select("code, city")
        .eq("ot_id", destination_ot_id)
        .eq("active", true)
        .single();

      if (!destPlant) throw new Error(`Invalid destination plant: ${destination_ot_id}`);
      destination_plant = destPlant.code;
    }

    // Auth
    const { data: authUserRes } = await userClient.auth.getUser();
    const userId = authUserRes.user?.id;
    if (!userId) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: corsHeaders });

    // Role gate
    const { data: me, error: meErr } = await svcClient
      .from("ot_platform_users")
      .select("id, role, plant, store, status")
      .eq("auth_user_id", userId)
      .eq("status", "active")
      .single();
    if (meErr || !me) return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403, headers: corsHeaders });

    const allowedRoles = new Set(["super_admin","warehouse_manager","retread_manager","plant_manager","operations_manager"]);
    if (!allowedRoles.has(me.role)) {
      return new Response(JSON.stringify({ message: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    // Idempotency check
    const finalIdempotencyKey = idempotency_key || crypto.randomUUID();
    const { data: already } = await svcClient
      .from("orders")
      .select("id")
      .eq("idempotency_key", finalIdempotencyKey)
      .limit(1);
    
    if (already && already.length > 0) {
      return new Response(JSON.stringify({ ok: true, conflict: true, order: already[0] }), { status: 409, headers: corsHeaders });
    }

    // Insert simple order
    const insertPayload = {
      order_type: 'transfer',
      is_regional: true,
      source_plant: originPlant.code,
      destination_plant,
      destination_store_id,
      source_mode: destination_kind === 'plant' ? 'PLANT_TO_PLANT' : 'STORE_TO_PLANT',
      product_number,
      quantity: Number(quantity),
      notes,
      idempotency_key: finalIdempotencyKey,
      name: 'Regional Order User',
      email: authUserRes.user?.email || 'unknown@example.com'
    };

    const { data: inserted, error: insErr } = await svcClient
      .from("orders")
      .insert(insertPayload)
      .select("id")
      .single();
    
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, order: inserted }), { status: 200, headers: corsHeaders });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ message }), { status: 400, headers: corsHeaders });
  }
});