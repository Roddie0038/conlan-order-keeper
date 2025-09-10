import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type, authorization",
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

  // soft format checks (use canonical fields if present, fall back to display fields)
  const s = orderData.store_number ?? orderData.store;
  const p = orderData.plant_code ?? orderData.plant;
  if (s && !/^\d{3}$/.test(String(s).match(/\d+/)?.[0] ?? "")) {
    return json({ error: "store_number must be 3 digits", got: s }, 400);
  }
  if (p && !/^\d{3}$/.test(String(p).match(/\d+/)?.[0] ?? "")) {
    return json({ error: "plant must be 3 digits", got: p }, 400);
  }
  if (orderData.order_type && orderData.order_type !== String(orderData.order_type).toLowerCase()) {
    return json({ error: "order_type must be lowercase", got: orderData.order_type }, 400);
  }

  try {
    // Create Supabase client with service role key for secure operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log(`🔒 SECURE ORDER PROCESSING - Processing ${action} for table ${tableName}`);

    if (action === 'create_order') {
      // Securely insert order using service role permissions
      const { data, error } = await supabase
        .from(tableName)
        .insert(orderData)
        .select()
        .single();

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