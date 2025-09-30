
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
    
    const { transferData, orderId, recipients } = requestBody;
    
    console.log("📧 TRANSFER NOTIFICATION - Processing order:", orderId);
    console.log("📧 TRANSFER NOTIFICATION - Recipients:", recipients);
    console.log("📧 TRANSFER NOTIFICATION - Transfer data:", transferData);

    if (!recipients || recipients.length === 0) {
      console.log("⚠️ TRANSFER NOTIFICATION - No email recipients provided for order:", orderId);
      
      // Log the attempt even if no recipients
      await logEmailNotification({
        orderId: orderId || 'unknown',
        orderType: transferData.orderType || 'TRANSFER',
        recipients: [],
        status: 'failed',
        notificationType: 'transfer_order_submitted',
        errorMessage: 'No recipients provided'
      });
      
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

    const emailBody = createEmailTemplate({
      orderType: transferData.orderType || 'Transfer',
      orderDetails: orderDetails,
      submitterInfo: {
        name: transferData.name,
        email: transferData.email
      },
      orderId: orderId,
      isCrossDock: isCrossDock,
      crossDockDetails: crossDockDetails
    });

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
      
      // Log successful email
      await logEmailNotification({
        orderId: orderId,
        orderType: transferData.orderType || 'TRANSFER',
        recipients: emailResult.sentTo || recipients,
        status: 'sent',
        notificationType: isCrossDock ? 'cross_dock_order_submitted' : 'transfer_order_submitted',
        isCrossDock: isCrossDock,
        emailProvider: 'resend'
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Order confirmation email sent successfully via Resend',
        recipients: (emailResult.sentTo || recipients).length,
        orderId: orderId,
        orderType: transferData.orderType || 'TRANSFER',
        store: transferData.store,
        emailId: (emailResult.data as any)?.id,
        isCrossDock: isCrossDock
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("❌ TRANSFER NOTIFICATION - Email sending failed:", emailResult.error);
      
      // Log failed email
      await logEmailNotification({
        orderId: orderId,
        orderType: transferData.orderType || 'TRANSFER',
        recipients: recipients,
        status: 'failed',
        notificationType: isCrossDock ? 'cross_dock_order_submitted' : 'transfer_order_submitted',
        isCrossDock: isCrossDock,
        emailProvider: 'resend',
        errorMessage: emailResult.error
      });
      
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
    
    // Log error
    try {
      await logEmailNotification({
        orderId: 'unknown',
        orderType: 'TRANSFER',
        recipients: [],
        status: 'failed',
        notificationType: 'transfer_order_submitted',
        emailProvider: 'resend',
        errorMessage: (error as Error).message
      });
    } catch (logError) {
      console.error("❌ Failed to log error:", logError);
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: (error as Error).message,
      details: (error as Error).stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
