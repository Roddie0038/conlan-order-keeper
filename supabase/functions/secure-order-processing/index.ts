import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization, x-client-info, apikey",
  "access-control-allow-methods": "POST,OPTIONS",
};

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json", ...cors } });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  let body: any;
  try { 
    body = await req.json(); 
  } catch { 
    return json({ error: "Invalid JSON body" }, 400); 
  }

  const { action, tableName, orderData } = body || {};
  const missing: string[] = [];
  if (!action) missing.push("action");
  if (!tableName) missing.push("tableName");
  if (!orderData) missing.push("orderData");
  if (missing.length) return json({ error: "Missing required fields", missing }, 400);

  // accept display, derive codes (belt-and-suspenders)
  const sIn = orderData.store_number ?? orderData.store;
  const pIn = orderData.plant_code   ?? orderData.plant;

  const s3 = (String(sIn).match(/\d+/)?.[0] ?? '').padStart(3,'0');  // "027"
  const p3 = (String(pIn).match(/\d+/)?.[0] ?? '').padStart(3,'0');  // "097"

  if (!/^\d{3}$/.test(s3)) return json({ error: 'store_number must be 3 digits', got: sIn }, 400);
  if (!/^\d{3}$/.test(p3)) return json({ error: 'plant must be 3 digits',       got: pIn }, 400);

  if (orderData.order_type && orderData.order_type !== String(orderData.order_type).toLowerCase()) {
    return json({ error: 'order_type must be lowercase', got: orderData.order_type }, 400);
  }

  try {
    // Create Supabase client with service role key for secure operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log(`🔒 SECURE ORDER PROCESSING - Processing ${action} for table ${tableName}`);

    if (action === 'create_order') {
      // strip non-DB fields before insert
      const { store_number, plant_code, idempotency_key, source, ...dbRow } = orderData;

      // persist display fields as-is (store/plant), but you can save codes in metadata if present
      if ('metadata' in dbRow && dbRow.metadata && typeof dbRow.metadata === 'object') {
        dbRow.metadata = { ...dbRow.metadata, store_number: s3, plant_code: p3, idempotency_key, source };
      }

      // IMPORTANT: if your table has dedicated code columns, map them explicitly
      // dbRow.store_number = s3; dbRow.plant_code = p3;

      if ('quantity' in dbRow) dbRow.quantity = Number(dbRow.quantity);

      const { data, error } = await supabase.from(tableName).insert(dbRow).select().single();
      if (error) {
        console.error('❌ SECURE ORDER PROCESSING - Database error:', error);
        return json({ error: error.message }, 400);
      }

      console.log('✅ SECURE ORDER PROCESSING - Order created successfully');
      return json({ data, success: true });
    }

    return json({ error: 'Invalid action' }, 400);

  } catch (error) {
    console.error('❌ SECURE ORDER PROCESSING - Unexpected error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
});