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
    
    // Validate required fields
    if (!body.product_number || !body.quantity || !body.store || !body.plant) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Normalize store format to "City Name 0XX"
    const normalizeStore = (store: string): string => {
      // Extract the numeric part
      const match = store.match(/(\d+)/);
      if (!match) return store;
      
      const storeNumber = match[1].padStart(3, '0');
      
      // Map store numbers to city names
      const storeMap: Record<string, string> = {
        '022': 'Fort Worth',
        '027': 'Grand Prairie', 
        '039': 'Irving',
        '048': 'Garland'
      };
      
      const cityName = storeMap[storeNumber];
      return cityName ? `${cityName} ${storeNumber}` : store;
    };

    // Prepare the order data
    const orderData = {
      product_number: body.product_number,
      quantity: body.quantity,
      notes: body.notes || null,
      store: normalizeStore(body.store),
      plant: body.plant,
      name: body.name,
      email: body.email,
      role: body.role,
      timestamp: body.timestamp,
      status: 'pending',
      completed: false,
      idempotency_key: crypto.randomUUID()
    };

    // Insert into orders table
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: corsHeaders }
      );
    }

    console.log('Order created successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: data,
        message: "Order submitted successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

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