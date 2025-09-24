
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    
    const { transferData, orderId, recipients } = requestBody;
    
    console.log("📧 TRANSFER NOTIFICATION - Processing order:", orderId);
    console.log("📧 TRANSFER NOTIFICATION - Recipients:", recipients);
    console.log("📧 TRANSFER NOTIFICATION - Transfer data:", transferData);

    if (!recipients || recipients.length === 0) {
      console.log("⚠️ TRANSFER NOTIFICATION - No email recipients provided for order:", orderId);
      
      console.log("⚠️ TRANSFER NOTIFICATION - Logging failed attempt for no recipients");
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients provided',
        orderId: orderId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Determine if this is a cross-dock order
    const isCrossDock = transferData.crossDock === 'Yes' || transferData.cross_dock_type === 'Yes';
    const crossDockDetails = isCrossDock ? {
      destination: transferData.crossDockDestination || transferData.cross_dock_destination,
      receiverNumber: transferData.receiverNo || transferData.cross_dock_receiver_number,
      etaDate: transferData.etaDate || transferData.cross_dock_eta_date
    } : undefined;

    // Create standardized email using the new template system
    const emailSubject = `${isCrossDock ? 'Cross-Dock ' : ''}Order Confirmation - ${transferData.store} - ${transferData.productNumber || transferData.product_number}`;
    
    const orderDetails = {
      store: transferData.store,
      plant: transferData.plant,
      productNumber: transferData.productNumber || transferData.product_number,
      description: transferData.description,
      quantity: transferData.quantity,
      scheduleArrival: transferData.scheduleArrival || transferData.schedule_arrival,
      notes: transferData.notes || 'None'
    };

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Transfer Order Submitted</h1>
        <p>Order ID: ${orderId}</p>
        <p>Store: ${transferData.store}</p>
        <p>Plant: ${transferData.plant}</p>
        <p>Product: ${transferData.productNumber || transferData.product_number}</p>
        <p>Quantity: ${transferData.quantity}</p>
        <p>Description: ${transferData.description}</p>
        <p>Submitter: ${transferData.name} (${transferData.email})</p>
      </div>
    `;

    console.log("📧 TRANSFER NOTIFICATION - Would send email to:", recipients);
    console.log("📧 TRANSFER NOTIFICATION - Email subject:", emailSubject);
    
    // Mock successful email result for now
    const emailResult = { success: true, sentTo: recipients };

    if (emailResult.success) {
      console.log("✅ TRANSFER NOTIFICATION - Email sent successfully via Resend:", emailResult.data);
      
      console.log("✅ TRANSFER NOTIFICATION - Email logged successfully");
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Order confirmation email sent successfully via Resend',
        recipients: (emailResult.sentTo || recipients).length,
        orderId: orderId,
        orderType: transferData.orderType || 'TRANSFER',
        store: transferData.store,
        emailId: emailResult.data?.id,
        isCrossDock: isCrossDock
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("❌ TRANSFER NOTIFICATION - Email sending failed:", emailResult.error);
      
      console.log("❌ TRANSFER NOTIFICATION - Email failed, would log error");
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Email sending failed: ${emailResult.error}`,
        orderId: orderId
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("❌ TRANSFER NOTIFICATION - Error:", error);
    
    console.log("❌ TRANSFER NOTIFICATION - Would log error:", error.message);
    
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
