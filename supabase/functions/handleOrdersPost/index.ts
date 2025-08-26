import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderRequest {
  product_number: string;
  quantity: number;
  notes?: string;
  store: string;
  plant: string;
  name: string;
  email: string;
  role: string;
  timestamp: string;
  idempotency_key?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the request body
    const body: OrderRequest = await req.json();

    // validate minimal fields
    const qty = Number(body.quantity);
    if (!body.product_number?.trim() || Number.isNaN(qty) || qty <= 0 || !body.store || !body.plant) {
      return new Response(JSON.stringify({ error: "Missing/invalid fields" }), { status: 400, headers: corsHeaders });
    }

    // idempotency: accept from client or mint once
    const idem = (body as any).idempotency_key ?? crypto.randomUUID();

    // Use existing normalize_store_format RPC for consistency
    const { data: normalizedStore } = await supabase.rpc('normalize_store_format', { store_input: body.store });

    // normalize
    const orderData = {
      product_number: body.product_number.trim(),
      quantity: qty,
      notes: body.notes?.trim() || null,
      store: (normalizedStore || body.store).trim(),
      plant: body.plant.trim(),
      name: (body.name ?? "").trim(),
      email: (body.email ?? "").trim(),
      role: (body.role ?? "").trim(),
      timestamp: body.timestamp ?? new Date().toISOString(),
      status: "pending",
      completed: false,
      idempotency_key: idem,
    };

    // insert
    const ins = await supabase.from("orders").insert([orderData]).select().single();

    if (ins.error) {
      if ((ins.error as any).code === "23505") {
        // duplicate: return existing
        const existing = await supabase.from("orders").select("*").eq("idempotency_key", idem).single();
        console.log(JSON.stringify({ evt: "regional_order.create", idempotency_key: idem, plant: orderData.plant, store: orderData.store, duplicate: true }));
        return new Response(JSON.stringify({ success: true, duplicate: true, order: existing.data, idempotency_key: idem }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("DB insert error:", ins.error);
      return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500, headers: corsHeaders });
    }

    console.log(JSON.stringify({ evt: "regional_order.create", idempotency_key: idem, plant: orderData.plant, store: orderData.store, duplicate: false }));
    return new Response(JSON.stringify({ success: true, order: ins.data, idempotency_key: idem }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Error processing order:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: corsHeaders }
    );
  }
});