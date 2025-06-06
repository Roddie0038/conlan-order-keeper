
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendEmail } from "../_shared/mailer.ts";
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
    
    const { transferData, orderId, recipients } = requestBody;
    
    console.log("📧 TRANSFER NOTIFICATION - Processing order:", orderId);
    console.log("📧 TRANSFER NOTIFICATION - Recipients:", recipients);
    console.log("📧 TRANSFER NOTIFICATION - Transfer data:", transferData);

    if (!recipients || recipients.length === 0) {
      console.log("⚠️ TRANSFER NOTIFICATION - No email recipients provided for order:", orderId);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients provided',
        orderId: orderId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create comprehensive email subject and body
    const emailSubject = `Order Confirmation - ${transferData.store} - ${transferData.productNumber || transferData.product_number}`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Order Submitted - Confirmation
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Order Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 8px 0;"><strong>Store:</strong> ${transferData.store}</li>
            <li style="margin: 8px 0;"><strong>Plant:</strong> ${transferData.plant}</li>
            <li style="margin: 8px 0;"><strong>Product Number:</strong> ${transferData.productNumber || transferData.product_number}</li>
            <li style="margin: 8px 0;"><strong>Description:</strong> ${transferData.description}</li>
            <li style="margin: 8px 0;"><strong>Quantity:</strong> ${transferData.quantity}</li>
            <li style="margin: 8px 0;"><strong>Schedule Arrival:</strong> ${transferData.scheduleArrival || transferData.schedule_arrival}</li>
            <li style="margin: 8px 0;"><strong>Submitted by:</strong> ${transferData.name} (${transferData.email})</li>
          </ul>
        </div>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Additional Information:</h3>
          <p><strong>Notes:</strong> ${transferData.notes || 'None'}</p>
        </div>
        
        ${transferData.crossDock === 'Yes' || transferData.cross_dock_type === 'Yes' ? `
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Cross Dock Information:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 8px 0;"><strong>Destination:</strong> ${transferData.crossDockDestination || transferData.cross_dock_destination}</li>
              <li style="margin: 8px 0;"><strong>Receiver Number:</strong> ${transferData.receiverNo || transferData.cross_dock_receiver_number || 'Not specified'}</li>
              <li style="margin: 8px 0;"><strong>ETA Date:</strong> ${transferData.etaDate || transferData.cross_dock_eta_date || 'Not specified'}</li>
            </ul>
          </div>
        ` : ''}
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <div style="text-align: center; color: #6c757d; font-size: 14px;">
          <p><em>This order has been assigned ID: ${orderId}</em></p>
          <p><em>Please review and process according to company procedures.</em></p>
          <p style="margin-top: 20px;">Conlan Tire Order Management System</p>
        </div>
      </div>
    `;

    console.log("📧 TRANSFER NOTIFICATION - Sending email via centralized mailer to:", recipients);
    console.log("📧 TRANSFER NOTIFICATION - Email subject:", emailSubject);
    
    // Send email via centralized mailer (Resend)
    const emailResult = await sendEmail({
      to: recipients,
      subject: emailSubject,
      html: emailBody
    });

    if (emailResult.success) {
      console.log("✅ TRANSFER NOTIFICATION - Email sent successfully via Resend:", emailResult.data);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Order confirmation email sent successfully via Resend',
        recipients: recipients.length,
        orderId: orderId,
        orderType: transferData.type || 'TRANSFER',
        store: transferData.store,
        emailId: emailResult.data?.id
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("❌ TRANSFER NOTIFICATION - Email sending failed:", emailResult.error);
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
