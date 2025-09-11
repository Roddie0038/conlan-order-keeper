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
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      db: { schema: 'public' },
      global: { headers: { 'Content-Profile': 'public', 'Accept-Profile': 'public' } }
    });

    console.log(`🔒 SECURE ORDER PROCESSING - Processing ${action} for table ${tableName}`);

    if (action === 'create_order') {
      // Map canonical fields directly to columns (don't strip them)
      const dbRow = {
        ...orderData,
        // Map canonical codes to columns
        store_number: s3,
        plant_code: p3,
        source: orderData.source ?? 'web',
        idempotency_key: orderData.idempotency_key ?? orderData.id,
        full_name: orderData.full_name ?? orderData.name ?? null,
        
        // Normalize order_type to lowercase
        order_type: String(orderData.order_type || '').toLowerCase(),
        
        // Coerce quantity to number
        quantity: Number(orderData.quantity),
        
        // Ensure metadata is always an object
        metadata: typeof orderData.metadata === 'object' && orderData.metadata !== null 
          ? orderData.metadata 
          : {}
      };

      console.log(`🔒 SECURE ORDER PROCESSING - Final mapped data:`, {
        store: dbRow.store,
        plant: dbRow.plant,
        store_number: dbRow.store_number,
        plant_code: dbRow.plant_code,
        source: dbRow.source,
        idempotency_key: dbRow.idempotency_key,
        full_name: dbRow.full_name,
        order_type: dbRow.order_type
      });

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