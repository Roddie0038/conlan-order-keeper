// supabase/functions/create-regional-order/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

type PlantCode = '097' | '098' | '099';
type OrderType = 'transfer' | 'mto';
type SourceMode = 'PLANT_TO_PLANT' | 'STORE_TO_PLANT';

interface RegionalOrderPayload {
  order_type: OrderType;
  regional_enabled: true;
  destination_store_id: string; // bigint as string (stores.id)
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
  transfer: "orders",   // adjust if your transfer "new requests" table is named differently
  mto: "mto_orders",
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

    // Coerce/validate inputs (supports bigint ids and plant names with codes)
    if (body?.regional_enabled !== true) throw new Error("regional_enabled must be true");
    if (!['transfer','mto'].includes(body?.order_type)) throw new Error("invalid order_type");

    const source_plant = toPlantCode(body?.source_plant);
    const destination_store_id = toBigintId(body?.destination_store_id);

    const source_mode = body?.source_mode;
    if (!['PLANT_TO_PLANT','STORE_TO_PLANT'].includes(source_mode)) throw new Error('invalid source_mode');
    let source_store_id: number | null = null;
    if (source_mode === 'STORE_TO_PLANT') {
      source_store_id = toBigintId(body?.source_store_id);
    }

    const idempotency_key = String(body?.idempotency_key || '').trim();
    if (!idempotency_key) throw new Error("idempotency_key required");

    // Auth
    const { data: authUserRes } = await userClient.auth.getUser();
    const userId = authUserRes.user?.id;
    if (!userId) return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401, headers: corsHeaders });

    // Role gate (your real columns)
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

    // Resolve destination store (id is bigint) and normalize its plant to code
    const { data: storeRow, error: storeErr } = await svcClient
      .from("stores")
      .select("id, store_number, store_name, plant")
      .eq("id", destination_store_id)
      .single();
    if (storeErr || !storeRow) throw new Error("Invalid destination_store_id");

    // Destination cannot be a plant masquerading as a store
    if (["097","098","099"].includes(String(storeRow.store_number))) {
      throw new Error("Destination cannot be a plant");
    }

    const destination_plant = toPlantCode(storeRow.plant);

    // Idempotency
    const table = TABLES[body.order_type as 'transfer'|'mto'];
    const { data: already } = await svcClient
      .from(table)
      .select("id, order_type, source_plant, destination_plant, destination_store_id")
      .eq("idempotency_key", idempotency_key)
      .limit(1);
    if (already && already.length > 0) {
      return new Response(JSON.stringify({ ok: true, conflict: true, order: already[0] }), { status: 409, headers: corsHeaders });
    }

    // Insert
    const insertPayload: Record<string, unknown> = {
      order_type: body.order_type, // OK if orders.order_type exists; remove for 'orders' if not present
      is_regional: true,
      source_plant,
      destination_plant,
      destination_store_id,
      source_mode,
      source_store_id,
      idempotency_key,
      transport_carrier: body?.transport?.carrier ?? null,
      transport_requested_pickup_at: body?.transport?.requested_pickup_at ?? null,
      transport_cross_dock_required: body?.transport?.cross_dock_required ?? null,
      transport_notes: body?.transport?.notes ?? null,
    };

    const { data: inserted, error: insErr } = await svcClient
      .from(table)
      .insert(insertPayload)
      .select("id, order_type, source_plant, destination_plant, destination_store_id")
      .single();
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ ok: true, order: inserted }), { status: 200, headers: corsHeaders });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ message }), { status: 400, headers: corsHeaders });
  }
});