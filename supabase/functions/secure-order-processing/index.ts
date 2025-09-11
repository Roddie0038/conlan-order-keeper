import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization, x-client-info, apikey, accept-profile, content-profile",
  "access-control-allow-methods": "POST,OPTIONS",
};

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", ...cors } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  let body: any;
  try { body = await req.json(); }
  catch { return json({ error: "Invalid JSON body" }, 400); }

  const { action, tableName, orderData } = body || {};
  const missing: string[] = [];
  if (!action) missing.push("action");
  if (!tableName) missing.push("tableName");
  if (!orderData) missing.push("orderData");
  if (missing.length) return json({ error: "Missing required fields", missing }, 400);

  // Normalize codes from either full text or numbers
  const sIn = orderData.store_number ?? orderData.store;
  const pIn = orderData.plant_code   ?? orderData.plant;
  const s3 = (String(sIn).match(/\d+/)?.[0] ?? "").padStart(3, "0");
  const p3 = (String(pIn).match(/\d+/)?.[0] ?? "").padStart(3, "0");

  if (!/^\d{3}$/.test(s3)) return json({ error: "store_number must be 3 digits", got: sIn }, 400);
  if (!/^\d{3}$/.test(p3)) return json({ error: "plant_code must be 3 digits", got: pIn }, 400);

  if (orderData.order_type && orderData.order_type !== String(orderData.order_type).toLowerCase()) {
    return json({ error: "order_type must be lowercase", got: orderData.order_type }, 400);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      db: { schema: "public" },
      global: { headers: { "Accept-Profile": "public", "Content-Profile": "public" } },
    });

    console.log(`🔒 SECURE ORDER - action=${action} table=${tableName}`);

    if (action === "create_order") {
      // remove non-table fields
      const { store_number, plant_code, idempotency_key, source, ...dbRow } = orderData;

      // types / coercions
      if ("quantity" in dbRow) dbRow.quantity = Number(dbRow.quantity);

      // metadata is optional jsonb; pass through if present
      // If your table has a metadata column, this will insert it. If not, PostgREST will 400 and we'll see it.
      // dbRow.metadata = dbRow.metadata ?? { store_number: s3, plant_code: p3, source, idempotency_key };

      // If table actually wants explicit numeric codes, map them here:
      // dbRow.store_number = s3; dbRow.plant_code = p3;

      const { data, error } = await supabase.from(tableName).insert(dbRow).select().single();

      if (error) {
        console.error("❌ DB error", { code: (error as any).code, details: error });
        // Return the exact error so the browser logs show it
        return json({ error: error.message ?? "insert failed", details: error }, 400);
      }

      console.log("✅ Order created", data?.id ?? "(no id)");
      return json({ success: true, data }, 200);
    }

    return json({ error: "Invalid action" }, 400);
  } catch (e: any) {
    console.error("❌ Unexpected", e);
    return json({ error: "internal", details: String(e?.message ?? e) }, 500);
  }
});