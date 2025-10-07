import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-internal-secret',
};

interface OtOrderPayload {
  order_number: string;
  product_number: string;
  quantity: number;
  store: string;
  plant: string;
  submitted_by_email: string;
  submitted_by_name: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify internal secret
    const internalSecret = req.headers.get('x-internal-secret');
    const expectedSecret = Deno.env.get('VITE_INTERNAL_SECRET');
    
    if (!internalSecret || internalSecret !== expectedSecret) {
      console.error('❌ INGEST-OT-ORDER: Invalid or missing x-internal-secret header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: OtOrderPayload = await req.json();
    console.log('📦 INGEST-OT-ORDER: Received payload:', payload);

    // Validate required fields
    if (!payload.product_number || !payload.store || !payload.plant) {
      console.error('❌ INGEST-OT-ORDER: Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: product_number, store, plant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare insert data - use crypto.randomUUID() for id, pass product_number exactly as typed
    const insertData = {
      id: crypto.randomUUID(), // UUID primary key
      order_number: payload.order_number,
      product_number: payload.product_number, // Pass exactly as typed, no auto-overwrite
      quantity: payload.quantity,
      store: payload.store,
      plant: payload.plant,
      submitted_by_email: payload.submitted_by_email,
      submitted_by_name: payload.submitted_by_name,
      status: 'pending',
      created_at: new Date().toISOString(),
      metadata: {
        external_id: payload.order_number, // Human-friendly ID in metadata
        source: 'ordering_platform'
      }
    };

    console.log('📦 INGEST-OT-ORDER: Inserting into public.ot_orders:', insertData);

    // Insert into public.ot_orders (not orders)
    const { data, error } = await supabase
      .from('ot_orders')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ INGEST-OT-ORDER: Database insert error:', error);
      return new Response(
        JSON.stringify({ error: error.message, details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ INGEST-OT-ORDER: Successfully inserted order:', data.id);

    return new Response(
      JSON.stringify({ 
        id: data.id, 
        created_at: data.created_at,
        order_number: data.order_number 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ INGEST-OT-ORDER: Unexpected error:', error);
    
    return new Response(
      JSON.stringify({
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
