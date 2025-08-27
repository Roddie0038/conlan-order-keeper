import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function badRequest(reason: string) {
  console.log("🌎 REGION: 400 Bad Request →", reason);
  return new Response(
    JSON.stringify({ ok: false, error: reason }),
    {
      status: 400,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    }
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const svc = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

    // Parse JSON body safely
    let body: any = null;
    try {
      body = await req.json();
    } catch (_) {
      return badRequest("invalid JSON");
    }

    // Allow-list of Phase-1 payload keys
    const allowed = new Set([
      "origin_ot_id",
      "destination_ot_id",
      "destination_kind",
      "product_number",
      "quantity",
      "notes",
      "name",
      "email",
      "role",
      "timestamp",
      "idempotency_key",
    ]);
    for (const k of Object.keys(body)) {
      if (!allowed.has(k)) {
        if (k.toLowerCase().includes("region")) {
          return badRequest("client must not send region fields");
        }
        // Non-fatal: ignore unknown keys but continue
      }
    }

    const {
      origin_ot_id,
      destination_ot_id,
      destination_kind,
    } = body as {
      origin_ot_id?: string;
      destination_ot_id?: string;
      destination_kind?: string;
    };

    if (!origin_ot_id) return badRequest("missing origin_ot_id");
    if (!destination_ot_id) return badRequest("missing destination_ot_id");
    if (!["plant", "store"].includes(String(destination_kind))) {
      return badRequest("invalid destination_kind");
    }

    // Validate product/qty minimally
    const qty = Number(body.quantity);
    if (!String(body.product_number || "").trim() || Number.isNaN(qty) || qty <= 0) {
      return badRequest("missing/invalid product_number or quantity");
    }

    // Idempotency key (client-provided or minted server-side)
    const idem = (body as any).idempotency_key ?? crypto.randomUUID();

    // Resolve ORIGIN plant (accepts exact ot_id like "Grand Prairie 097")
    const { data: originPlant, error: originPlantErr } = await svc
      .from("app_plants")
      .select("id, code, ot_id, active")
      .ilike("ot_id", String(origin_ot_id))
      .maybeSingle();
    if (originPlantErr) console.error("originPlant query error:", originPlantErr);
    if (!originPlant) return badRequest("unknown origin plant");

    // Resolve origin region via mapping (first-by-name fallback)
    const { data: originRegions, error: originRegionsErr } = await svc
      .from("app_plant_regions")
      .select("region_id, app_regions!inner(name)")
      .eq("plant_id", originPlant.id)
      .order("name", { ascending: true, foreignTable: "app_regions" });
    if (originRegionsErr) console.error("originRegions query error:", originRegionsErr);
    const origin_region_id = originRegions?.[0]?.region_id as string | undefined;
    if (!origin_region_id) return badRequest("no plant-region mapping for origin plant");
    console.log("🌎 REGION: origin", originPlant.code, "→", origin_region_id);

    // Resolve DESTINATION
    let destination_region_id: string | null = null;
    let destination_store_number: string | null = null;
    if (String(destination_kind) === "store") {
      const { data: destStore, error: destStoreErr } = await svc
        .from("ot_stores")
        .select("ot_id, region_id, inherit_region, plant_id")
        .eq("ot_id", String(destination_ot_id))
        .maybeSingle();
      if (destStoreErr) console.error("destStore query error:", destStoreErr);
      if (!destStore) return badRequest("unknown destination store");
      if (!destStore.region_id) return badRequest("destination store has no region_id");
      destination_region_id = destStore.region_id as string;
      const digits = String(destination_ot_id).replace(/\D/g, "");
      destination_store_number = digits ? digits.padStart(3, "0") : null;
      console.log("🌎 REGION: destination store →", destination_region_id);
    } else {
      const { data: destPlant, error: destPlantErr } = await svc
        .from("app_plants")
        .select("id, code, ot_id")
        .ilike("ot_id", String(destination_ot_id))
        .maybeSingle();
      if (destPlantErr) console.error("destPlant query error:", destPlantErr);
      if (!destPlant) return badRequest("unknown destination plant");
      const { data: destRegions, error: destRegionsErr } = await svc
        .from("app_plant_regions")
        .select("region_id, app_regions!inner(name)")
        .eq("plant_id", destPlant.id)
        .order("name", { ascending: true, foreignTable: "app_regions" });
      if (destRegionsErr) console.error("destRegions query error:", destRegionsErr);
      destination_region_id = (destRegions?.[0]?.region_id as string) ?? null;
      if (!destination_region_id) return badRequest("no plant-region mapping for destination plant");
      console.log("🌎 REGION: destination plant →", destination_region_id);
    }

    // Optional: normalize store display if we have a store number
    let normalizedStore: string | null = null;
    if (destination_store_number) {
      const norm = await svc.rpc("normalize_store_format", { store_input: destination_store_number });
      if (norm.error) {
        console.warn("normalize_store_format RPC error:", norm.error);
        normalizedStore = destination_store_number;
      } else {
        normalizedStore = (norm.data as string) || destination_store_number;
      }
    }

    // Build order row compatible with existing "orders" table
    const orderData = {
      product_number: String(body.product_number).trim(),
      quantity: qty,
      notes: String(body.notes ?? "").trim() || null,
      store: normalizedStore, // null for plant→plant
      plant: originPlant.ot_id, // e.g. "Grand Prairie 097"
      name: String(body.name ?? "").trim(),
      email: String(body.email ?? "").trim(),
      role: String(body.role ?? "").trim(),
      timestamp: body.timestamp ?? new Date().toISOString(),
      status: "pending",
      completed: false,
      idempotency_key: idem,
      // Trace fields for debugging/auditing (acceptable as extra columns if present)
      destination_kind: String(destination_kind),
      origin_ot_id: String(origin_ot_id),
      destination_ot_id: String(destination_ot_id),
      origin_region_id,
      destination_region_id,
    } as Record<string, unknown>;

    const ins = await svc.from("orders").insert([orderData]).select().single();

    if (ins.error) {
      if ((ins.error as any).code === "23505") {
        // Duplicate idempotency key: return the existing row
        const existing = await svc
          .from("orders")
          .select("*")
          .eq("idempotency_key", idem)
          .maybeSingle();
        console.log(
          JSON.stringify({
            evt: "regional_order.create",
            idempotency_key: idem,
            duplicate: true,
          })
        );
        return new Response(
          JSON.stringify({ ok: true, duplicate: true, order: existing.data, idempotency_key: idem }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("DB insert error:", ins.error);
      return new Response(
        JSON.stringify({ ok: false, error: "failed to create order" }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log(
      JSON.stringify({ evt: "regional_order.create", idempotency_key: idem, duplicate: false })
    );
    return new Response(
      JSON.stringify({ ok: true, order: ins.data, idempotency_key: idem }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing order:", error);
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
