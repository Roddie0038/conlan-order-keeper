
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
    
    const { transferData, orderId, store_number } = requestBody;
    
    console.log("📧 TRANSFER NOTIFICATION - Processing order:", orderId);
    console.log("📧 TRANSFER NOTIFICATION - Store:", store_number);
    console.log("📧 TRANSFER NOTIFICATION - Transfer data:", transferData);

    // Use notification-controller to resolve recipients via SQL function
    if (!store_number) {
      console.log("⚠️ TRANSFER NOTIFICATION - No store_number provided for order:", orderId);
      
      // Log the attempt even if no store
      await logEmailNotification({
        orderId: orderId || 'unknown',
        orderType: transferData.orderType || 'TRANSFER',
        recipients: [],
        status: 'failed',
        notificationType: 'transfer_order_submitted',
        errorMessage: 'No store_number provided'
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No store_number provided',
        orderId: orderId
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
      plant: transferData.plant,
      payload: {
        order_id: orderId,
        store_name: transferData.store,
        submitted_by_name: transferData.name,
        submitted_by_email: transferData.email,
        product_number: transferData.productNumber || transferData.product_number,
        quantity: transferData.quantity,
        description: transferData.description,
        notes: transferData.notes || 'None',
        timestamp: new Date().toISOString()
      },
      idempotency_key: `transfer-${orderId}-${Date.now()}`,
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
        orderId: orderId,
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
        orderId: orderId
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // The notification-controller handles all email sending now

  } catch (error) {
    console.error("❌ TRANSFER NOTIFICATION - Error:", error);
    
    // Log error
    try {
      await logEmailNotification({
        orderId: 'unknown',
        orderType: 'TRANSFER',
        recipients: [],
        status: 'failed',
        notificationType: 'transfer_order_submitted',
        emailProvider: 'resend',
        errorMessage: error.message
      });
    } catch (logError) {
      console.error("❌ Failed to log error:", logError);
    }
    
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
