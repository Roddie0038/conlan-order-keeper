import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the request body
    const orderData = await req.json();
    console.log('Received order data:', orderData);

    // Validate required fields
    const requiredFields = ['plant', 'store', 'full_name', 'email', 'product_number', 'quantity'];
    const missingFields = requiredFields.filter(field => !orderData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Prepare data for orders table
    const orderRecord = {
      plant: orderData.plant,
      store: orderData.store,
      name: orderData.full_name,
      email: orderData.email,
      product_number: orderData.product_number,
      description: orderData.description || '',
      quantity: parseInt(orderData.quantity),
      notes: orderData.notes || '',
      timestamp: orderData.timestamp || new Date().toISOString(),
      type: orderData.order_type || 'transfer',
      status: 'pending'
    };

    console.log('Inserting order record:', orderRecord);

    // Insert into orders table
    const { data, error } = await supabase
      .from('orders')
      .insert([orderRecord])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log('Order inserted successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: data.id,
        message: 'Order submitted successfully' 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing order:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 400,
      }
    )
  }
})