
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase client for idempotency checks
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Google Apps Script webhook URL for wheel orders
const WHEEL_ORDERS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyHgFTW0pDGhZOHwUjW5zeqWebs6pXH53Ud8FFC-87bMxCNEf406j0Eu8dQvo_zAhJUEQ/exec";

serve(async (req) => {
  console.log("🚀 EDGE FUNCTION - wheel-order-webhook called");
  console.log("🚀 EDGE FUNCTION - Method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("✅ EDGE FUNCTION - Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.error("❌ EDGE FUNCTION - Invalid method:", req.method);
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const wheelOrderData = await req.json();
    console.log("🚀 EDGE FUNCTION - Received wheel order data:", JSON.stringify(wheelOrderData, null, 2));

    // ============= IDEMPOTENCY CHECK - Prevent Duplicate Wheel Order Processing =============
    // Create a deterministic idempotency key from the order data
    const idempotencyKey = `wheel-webhook:${wheelOrderData.order_number || wheelOrderData.orderNumber || wheelOrderData.wheel_number || `${wheelOrderData.store}-${wheelOrderData.customerName}-${wheelOrderData.wheelSize}-${Date.now()}`}`;
    console.log("🔑 WHEEL WEBHOOK - Checking idempotency key:", idempotencyKey);
    
    const { data: existingProcessing, error: idempotencyCheckError } = await supabase
      .from('notification_idempotency')
      .select('id, created_at')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (idempotencyCheckError) {
      console.error('❌ WHEEL WEBHOOK - Error checking idempotency:', idempotencyCheckError);
      // Continue anyway - don't block processing due to idempotency check failures
    } else if (existingProcessing) {
      console.log(`⚠️ WHEEL WEBHOOK - DUPLICATE PREVENTED - Wheel order already processed at ${existingProcessing.created_at}`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Duplicate wheel order processing prevented',
        idempotencyKey: idempotencyKey,
        previouslyProcessedAt: existingProcessing.created_at
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record this processing attempt
    const { error: insertError } = await supabase
      .from('notification_idempotency')
      .insert({
        idempotency_key: idempotencyKey,
        notification_type: 'wheel_webhook_processing',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ WHEEL WEBHOOK - Error recording idempotency key:', insertError);
      // Continue anyway - don't block processing due to recording failures
    } else {
      console.log('✅ WHEEL WEBHOOK - Idempotency key recorded, proceeding with processing');
    }
    // ============= END IDEMPOTENCY CHECK =============

    // Forward the request to Google Apps Script webhook
    console.log("🚀 EDGE FUNCTION - Forwarding to Google Sheets webhook:", WHEEL_ORDERS_WEBHOOK_URL);
    
    const response = await fetch(WHEEL_ORDERS_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(wheelOrderData),
    });

    console.log("✅ EDGE FUNCTION - Google Sheets response status:", response.status);
    console.log("✅ EDGE FUNCTION - Google Sheets response statusText:", response.statusText);

    if (response.ok) {
      console.log("✅ EDGE FUNCTION - Successfully forwarded wheel order to Google Sheets");
      
      // After successful Google Sheets submission, trigger email notifications if store info is available
      const storeNumber = wheelOrderData.storeName?.match(/\d+$/)?.[0] || wheelOrderData.store?.match(/\d+$/)?.[0];
      if (storeNumber) {
        try {
          console.log("📧 WHEEL WEBHOOK - Triggering email notifications for store:", storeNumber);
          
          // Use the same deterministic order ID for notifications (not random!)
          const orderId = wheelOrderData.order_number || wheelOrderData.orderNumber || wheelOrderData.wheel_number || idempotencyKey;
          
          // Call the wheel notification function
          const emailResponse = await fetch(
            `https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/wheel-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
              },
              body: JSON.stringify({
                wheelData: wheelOrderData,
                orderId: orderId, // Use deterministic order ID instead of random UUID
                recipients: [] // Will be populated by the contact system in wheel-notification
              })
            }
          );
          
          if (emailResponse.ok) {
            console.log("✅ WHEEL WEBHOOK - Email notification sent successfully");
          } else {
            console.error("❌ WHEEL WEBHOOK - Email notification failed");
          }
        } catch (emailError) {
          console.error("❌ WHEEL WEBHOOK - Error sending email notification:", emailError);
        }
      }
      
      return new Response(JSON.stringify({ success: true, message: 'Wheel order submitted successfully' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("❌ EDGE FUNCTION - Google Sheets webhook failed:", response.status, response.statusText);
      return new Response(JSON.stringify({ success: false, error: 'Failed to submit to Google Sheets' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("❌ EDGE FUNCTION - Error in wheel-order-webhook:", error);
    return new Response(JSON.stringify({ success: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
