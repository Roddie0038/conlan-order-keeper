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

    // Enhanced validation with detailed logging
    const validateRequiredFields = (data: any): string[] => {
      const errors: string[] = [];
      
      if (!data.product_number || data.product_number.toString().trim() === '') {
        errors.push('product_number is required');
      }
      if (!data.casing_grade || data.casing_grade.toString().trim() === '') {
        errors.push('casing_grade is required');
      }
      if (!data.tire_size || data.tire_size.toString().trim() === '') {
        errors.push('tire_size is required');
      }
      
      const quantity = parseInt(data.quantity?.toString()) || 0;
      if (quantity <= 0) {
        errors.push('quantity must be greater than 0');
      }
      
      return errors;
    };

    // Validate required fields first
    const validationErrors = validateRequiredFields(normalized);
    if (validationErrors.length > 0) {
      console.error('❌ RECEIVE MTO - Validation failed:', validationErrors);
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed', 
          details: validationErrors,
          received_data: normalized
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform the payload to match Supabase schema with enhanced validation
    const rawStore = normalized.store || '';
    const normalizedStoreName = normalizeStore(rawStore);
    const storeNumber = rawStore.match(/\d{3}$/)?.[0] || 
                       rawStore.match(/\d{2,3}/)?.[0]?.padStart(3, '0') || '027';

    const mtoOrderData = {
      timestamp: normalized.timestamp || new Date().toISOString(),
      name: normalized.contact || normalized.name || '',
      store: normalizedStoreName,
      store_number: storeNumber,
      product_number: normalized.product_number || normalized.description || '',
      tire_size: ts,
      quantity: parseInt(normalized.quantity?.toString()) || 0,
      email: normalized.email || '',
      plant: normalized.plant || 'Grand Prairie 097', // Use provided plant or default
      order_type: 'MTO', // Uppercase as enforced by trigger
      type: 'MTO',
      status: 'open', // Will be normalized by trigger
      status_updated_at: new Date().toISOString(),
      tread: normalized.tread || normalized.description || '',
      casing_grade: cg,
      description: normalized.description || `MTO - ${normalized.tread || ''} - ${ts}`,
      // Add new fields for better tracking
      submitted_by_name: normalized.name || normalized.contact || '',
      submitted_by_email: normalized.email || '',
      // Add idempotency support
      idempotency_key: normalized.idempotency_key || `mto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('🔍 RECEIVE MTO - Mapped order data:', mtoOrderData);

    // Insert into Supabase mto_orders table with upsert for idempotency
    const { data: insertedOrder, error: insertError } = await supabase
      .from('mto_orders')
      .upsert(mtoOrderData, { 
        onConflict: 'idempotency_key',
        ignoreDuplicates: false 
      })
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
          original_payload: mtoOrderData
        }
      });
    } catch (logError) {
      console.error('❌ RECEIVE MTO - Notification log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        order_id: insertedOrder.id,
        idempotency_key: insertedOrder.idempotency_key,
        order_type: insertedOrder.order_type,
        status: insertedOrder.status,
        store_number: insertedOrder.store_number,
        message: 'MTO order received and processed successfully' 
      }),
      { 
        status: 201,
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