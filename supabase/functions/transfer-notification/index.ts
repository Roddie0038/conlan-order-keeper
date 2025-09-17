
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendEmail, createEmailTemplate, logEmailNotification } from "../_shared/mailer.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Email notification for Transfer Request orders
serve(async (req) => {
  console.log("🚀 TRANSFER NOTIFICATION - Edge function called");
  console.log("🚀 TRANSFER NOTIFICATION - Request method:", req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const requestBody = await req.json();
    console.log("📧 TRANSFER NOTIFICATION - Request body:", JSON.stringify(requestBody, null, 2));
    
    const { order_id, store_number, plant_id, event = "created", metadata = {} } = requestBody;
    
    console.log("📧 TRANSFER NOTIFICATION - Processing order:", order_id);
    console.log("📧 TRANSFER NOTIFICATION - Store:", store_number);
    console.log("📧 TRANSFER NOTIFICATION - Plant:", plant_id);
    console.log("📧 TRANSFER NOTIFICATION - Event:", event);

    // Validate required fields
    if (!store_number) {
      console.log("⚠️ TRANSFER NOTIFICATION - No store_number provided for order:", order_id);
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No store_number provided',
        order_id: order_id
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call notification-controller to resolve recipients and send emails
    const controllerUrl = Deno.env.get('SUPABASE_URL') + '/functions/v1/notification-controller';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    const notificationPayload = {
      order_type: 'transfer',
      store_number: store_number,
      plant: plant_id,
      payload: {
        order_id: order_id,
        event: event,
        timestamp: new Date().toISOString(),
        metadata: metadata
      },
      idempotency_key: `transfer-${order_id}-${Date.now()}`,
      source: 'transfer-notification'
    };

    console.log("📧 TRANSFER NOTIFICATION - Calling notification-controller:", notificationPayload);

    const controllerResponse = await fetch(controllerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify(notificationPayload)
    });

    const controllerResult = await controllerResponse.json();

    if (controllerResponse.ok) {
      console.log("✅ TRANSFER NOTIFICATION - Controller succeeded:", controllerResult);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Transfer notification processed successfully',
        order_id: order_id,
        recipients_found: controllerResult.recipients_found || 0,
        results: controllerResult.results
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("❌ TRANSFER NOTIFICATION - Controller failed:", controllerResult);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Notification controller failed: ${controllerResult.error}`,
        order_id: order_id
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // The notification-controller handles all email sending now

  } catch (error) {
    console.error("❌ TRANSFER NOTIFICATION - Error:", error);
    
    // Log error (simplified)
    console.error("❌ TRANSFER NOTIFICATION - Error details:", error.stack);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
