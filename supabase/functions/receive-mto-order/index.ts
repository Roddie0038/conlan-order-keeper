import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));

    const cg = body?.casing_grade ??
      body?.orderRecord?.casing_grade ??
      body?.casingGrade ??
      body?.orderRecord?.casingGrade ?? '';

    const ts = body?.tire_size ??
      body?.orderRecord?.tire_size ??
      body?.tireSize ??
      body?.orderRecord?.tireSize ?? '';

    console.log('[MTO PAYLOAD]', {
      at: 'receive-mto-order',
      order_id: body?.order_id ?? body?.orderRecord?.order_id ?? null,
      casing_grade: cg,
      tire_size: ts,
      keys: Object.keys(body || {})
    });

    const normalized = { ...body, casing_grade: cg, tire_size: ts };
    console.log('🔍 RECEIVE MTO - Incoming payload:', normalized);

    // Create Supabase client with service role key for secure operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Normalize store format (Store 027 -> Grand Prairie 027)
    const normalizeStore = (store: string): string => {
      if (!store) return store;
      
      const storeMapping: Record<string, string> = {
        'Store 022': 'Fort Worth 022',
        'Store 027': 'Grand Prairie 027',
        'Store 028': 'Houston 028',
        'Store 029': 'San Antonio 029',
        'Store 030': 'Oklahoma City 030',
        'Store 032': 'Little Rock 032',
        'Store 033': 'Kansas City 033',
        'Store 035': 'Laredo 035',
        'Store 036': 'Tulsa 036',
        'Store 039': 'Austin 039'
      };
      
      return storeMapping[store] || store;
    };

    // Transform the payload to match Supabase schema
    const mtoOrderData = {
      timestamp: normalized.timestamp || new Date().toISOString(),
      name: normalized.contact || normalized.name || '',
      store: normalizeStore(normalized.store || ''),
      product_number: normalized.description || normalized.product_number || '',
      tire_size: ts || normalized.tire_type || '',
      quantity: parseInt(normalized.quantity?.toString()) || 0,
      email: normalized.email || '',
      plant: 'Grand Prairie 097', // Default plant
      order_type: 'MTO',
      type: 'MTO',
      status: 'open',
      status_updated_at: new Date().toISOString(),
      tread: normalized.description || normalized.tread || '',
      casing_grade: cg || 'Grade 1',
      description: `MTO - ${normalized.description || ''} - ${ts || normalized.tire_type || ''}`
    };

    console.log('🔍 RECEIVE MTO - Mapped order data:', mtoOrderData);

    // Insert into Supabase mto_orders table
    const { data: insertedOrder, error: insertError } = await supabase
      .from('mto_orders')
      .insert(mtoOrderData)
      .select()
      .single();

    if (insertError) {
      console.error('❌ RECEIVE MTO - Database insert error:', insertError);
      return new Response(
        JSON.stringify({ error: `Database insert failed: ${insertError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ RECEIVE MTO - Order inserted successfully:', insertedOrder);

    // Trigger email notifications (non-blocking)
    try {
      console.log('📧 RECEIVE MTO - Triggering email notifications');
      
      const emailResponse = await fetch(
        `${supabaseUrl}/functions/v1/mto-notification-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceRoleKey}`
          },
          body: JSON.stringify({
            orderRecord: insertedOrder,
            emailType: 'casings_needed',
            triggerSource: 'external_webhook'
          })
        }
      );

      if (emailResponse.ok) {
        console.log('✅ RECEIVE MTO - Email notification triggered successfully');
      } else {
        console.warn('⚠️ RECEIVE MTO - Email notification failed:', await emailResponse.text());
      }
    } catch (emailError) {
      console.error('❌ RECEIVE MTO - Email notification error:', emailError);
      // Don't fail the order insertion if email fails
    }

    // Log notification for audit trail
    try {
      await supabase.from('notification_logs').insert({
        order_id: insertedOrder.id,
        order_number: insertedOrder.id?.toString(),
        order_type: 'mto',
        notification_type: 'mto_casings_needed',
        recipient_email: insertedOrder.email || 'system@conlantire.com',
        recipient_role: 'store_manager',
        status: 'triggered',
        plant: insertedOrder.plant,
        store: insertedOrder.store,
        platform: 'external_webhook',
        metadata: {
          trigger_source: 'external_webhook',
          original_payload: payload
        }
      });
    } catch (logError) {
      console.error('❌ RECEIVE MTO - Notification log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: insertedOrder.id,
        message: 'MTO order received and processed successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ RECEIVE MTO - Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});