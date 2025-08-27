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

// Unified payload types for backward compatibility
interface LegacyPayload {
  origin_ot_id?: string;
  destination_ot_id?: string;
  destination_kind?: 'plant' | 'store';
  line_items?: Array<{
    product_number: string;
    description: string;
    quantity: number;
    notes?: string;
  }>;
  requester?: {
    full_name: string;
    email: string;
    role?: string;
  };
}

interface LineItem {
  product_number: string;
  description: string;
  quantity: number;
  notes?: string;
}

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
    console.log('📦 REGIONAL: Received payload:', JSON.stringify(body, null, 2));

    // Handle both legacy and new payload formats
    const isLegacyFormat = body?.origin_ot_id && body?.destination_ot_id && body?.destination_kind;
    const isNewFormat = body?.regional_enabled === true && body?.order_type;

    let processedPayload: any;
    let lineItems: LineItem[] = [];

    if (isLegacyFormat) {
      console.log('🧭 ROUTE: Processing legacy ot_id format');
      
      // Convert ot_id format to plant/store lookup
      const { data: originPlant } = await svcClient
        .from("app_plants")
        .select("code, city")
        .eq("ot_id", body.origin_ot_id)
        .eq("active", true)
        .single();

      if (!originPlant) throw new Error(`Invalid origin plant: ${body.origin_ot_id}`);

      let destination_store_id: number | null = null;
      let destination_plant: string;

      if (body.destination_kind === 'store') {
        const { data: destStore } = await svcClient
          .from("app_stores")
          .select("store_code, city, id")
          .eq("ot_id", body.destination_ot_id)
          .eq("active", true)
          .single();

        if (!destStore) throw new Error(`Invalid destination store: ${body.destination_ot_id}`);
        
        destination_store_id = destStore.id;
        // For store orders, we need to map to the plant that serves this store
        destination_plant = originPlant.code; // For now, assume same plant
      } else {
        const { data: destPlant } = await svcClient
          .from("app_plants")
          .select("code, city")
          .eq("ot_id", body.destination_ot_id)
          .eq("active", true)
          .single();

        if (!destPlant) throw new Error(`Invalid destination plant: ${body.destination_ot_id}`);
        destination_plant = destPlant.code;
      }

      // Extract line items from new format
      lineItems = body.line_items || [
        {
          product_number: body.product_number || '',
          description: body.description || 'Regional Order Item',
          quantity: body.quantity || 1,
          notes: body.notes
        }
      ];

      processedPayload = {
        regional_enabled: true,
        order_type: 'transfer',
        source_plant: originPlant.code as PlantCode,
        destination_store_id: destination_store_id,
        source_mode: body.destination_kind === 'plant' ? 'PLANT_TO_PLANT' : 'STORE_TO_PLANT' as SourceMode,
        idempotency_key: body.idempotency_key || crypto.randomUUID()
      };

      console.log('🧭 ROUTE: Converted to processed payload:', JSON.stringify(processedPayload, null, 2));
    } else if (isNewFormat) {
      console.log('🧭 ROUTE: Processing original regional format');
      processedPayload = body;
    } else {
      throw new Error("Invalid payload format - must include either legacy ot_id fields or regional_enabled");
    }

    // Validate required fields for original format
    if (processedPayload?.regional_enabled !== true) throw new Error("regional_enabled must be true");
    if (!['transfer','mto'].includes(processedPayload?.order_type)) throw new Error("invalid order_type");

    const source_plant = toPlantCode(processedPayload?.source_plant);
    const destination_store_id = processedPayload?.destination_store_id ? toBigintId(processedPayload.destination_store_id) : null;

    const source_mode = processedPayload?.source_mode;
    if (!['PLANT_TO_PLANT','STORE_TO_PLANT'].includes(source_mode)) throw new Error('invalid source_mode');
    let source_store_id: number | null = null;
    if (source_mode === 'STORE_TO_PLANT') {
      source_store_id = toBigintId(processedPayload?.source_store_id);
    }

    const idempotency_key = String(processedPayload?.idempotency_key || '').trim();
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

    // Resolve destination store if provided
    let destination_plant: string;
    let storeRow: any = null;
    
    if (destination_store_id) {
      const { data: store, error: storeErr } = await svcClient
        .from("stores")
        .select("id, store_number, store_name, plant")
        .eq("id", destination_store_id)
        .single();
      if (storeErr || !store) throw new Error("Invalid destination_store_id");

      // Destination cannot be a plant masquerading as a store
      if (["097","098","099"].includes(String(store.store_number))) {
        throw new Error("Destination cannot be a plant");
      }

      storeRow = store;
      destination_plant = toPlantCode(store.plant);
    } else {
      // For plant-to-plant orders, destination_plant should be derived from the payload
      destination_plant = source_plant; // Default fallback, should be set properly in legacy conversion
    }

    // Idempotency
    const table = TABLES[processedPayload.order_type as 'transfer'|'mto'];
    const { data: already } = await svcClient
      .from(table)
      .select("id, order_type, source_plant, destination_plant, destination_store_id")
      .eq("idempotency_key", idempotency_key)
      .limit(1);
    if (already && already.length > 0) {
      return new Response(JSON.stringify({ ok: true, conflict: true, order: already[0] }), { status: 409, headers: corsHeaders });
    }

    // Insert order with line items
    const insertPayload: Record<string, unknown> = {
      order_type: processedPayload.order_type,
      is_regional: true,
      source_plant,
      destination_plant,
      destination_store_id,
      source_mode,
      source_store_id,
      idempotency_key,
      transport_carrier: processedPayload?.transport?.carrier ?? null,
      transport_requested_pickup_at: processedPayload?.transport?.requested_pickup_at ?? null,
      transport_cross_dock_required: processedPayload?.transport?.cross_dock_required ?? null,
      transport_notes: processedPayload?.transport?.notes ?? null,
      // Store line items as JSONB if multiple items
      line_items: lineItems.length > 0 ? lineItems : null,
      // For single item backward compatibility
      product_number: lineItems[0]?.product_number ?? null,
      description: lineItems[0]?.description ?? null,
      quantity: lineItems[0]?.quantity ?? null,
      notes: lineItems[0]?.notes ?? null,
      // Requester info
      name: body?.requester?.full_name ?? body?.name ?? 'Unknown',
      email: body?.requester?.email ?? body?.email ?? 'unknown@example.com',
      role: body?.requester?.role ?? body?.role ?? '',
    };

    console.log('📦 REGIONAL: Final insert payload:', JSON.stringify(insertPayload, null, 2));

    const { data: inserted, error: insErr } = await svcClient
      .from(table)
      .insert(insertPayload)
      .select("id, order_type, source_plant, destination_plant, destination_store_id")
      .single();
    if (insErr) {
      console.error('📦 REGIONAL: Insert error:', insErr);
      throw insErr;
    }

    console.log('📦 REGIONAL: Order created successfully:', inserted);

    // TODO: Call notification-controller for email alerts
    console.log('📧 MAIL: Email notifications would be sent here');

    return new Response(JSON.stringify({ ok: true, order: inserted }), { status: 200, headers: corsHeaders });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ message }), { status: 400, headers: corsHeaders });
  }
});