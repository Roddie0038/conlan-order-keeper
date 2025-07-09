import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendEmail, createEmailTemplate, logEmailNotification } from "../_shared/mailer.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Email notification for MTO orders - migrated to use Resend
serve(async (req) => {
  console.log("🚀 MTO NOTIFICATION - Edge function called");
  console.log("🚀 MTO NOTIFICATION - Request method:", req.method);
  
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
    console.log("📧 MTO NOTIFICATION - Request body:", JSON.stringify(requestBody, null, 2));
    
    const { mtoData, orderId, recipients } = requestBody;
    
    console.log("📧 MTO NOTIFICATION - Processing MTO order:", orderId);
    console.log("📧 MTO NOTIFICATION - Recipients:", recipients);
    console.log("📧 MTO NOTIFICATION - MTO data:", mtoData);

    if (!recipients || recipients.length === 0) {
      console.log("⚠️ MTO NOTIFICATION - No email recipients provided for MTO order:", orderId);
      
      // Log the attempt even if no recipients
      await logEmailNotification({
        orderId: orderId || 'unknown',
        orderType: 'MTO',
        recipients: [],
        status: 'failed',
        notificationType: 'mto_order_submitted',
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

    // Create standardized email using the new template system
    const emailSubject = `MTO Order - ${mtoData.store} - ${mtoData.product_number || mtoData.productNumber}`;
    
    const orderDetails = {
      store: mtoData.store,
      plant: mtoData.plant,
      productNumber: mtoData.product_number || mtoData.productNumber,
      tireSize: mtoData.tire_size || mtoData.tireSize,
      tread: mtoData.tread || mtoData.tireTreadNeeded,
      casingGrade: mtoData.casing_grade || mtoData.casingGrade,
      quantity: mtoData.quantity,
      notes: mtoData.notes || 'None',
      haveCasings: mtoData.have_casings ? 'Yes' : 'No'
    };

    const emailBody = createEmailTemplate({
      orderType: 'MTO',
      orderDetails: orderDetails,
      submitterInfo: {
        name: mtoData.name,
        email: mtoData.email
      },
      orderId: orderId,
      isCrossDock: false // MTO orders are not cross-dock
    });

    console.log("📧 MTO NOTIFICATION - Sending email via centralized mailer to:", recipients);
    console.log("📧 MTO NOTIFICATION - Email subject:", emailSubject);
    
    // Send email via centralized mailer (Resend)
    const emailResult = await sendEmail({
      to: recipients,
      subject: emailSubject,
      html: emailBody
    });

    if (emailResult.success) {
      console.log("✅ MTO NOTIFICATION - Email sent successfully via Resend:", emailResult.data);
      
      // Log successful email
      await logEmailNotification({
        orderId: orderId,
        orderType: 'MTO',
        recipients: emailResult.sentTo || recipients,
        status: 'sent',
        notificationType: 'mto_order_submitted',
        emailProvider: 'resend'
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'MTO notification sent successfully via Resend',
        recipients: (emailResult.sentTo || recipients).length,
        orderId: orderId,
        orderType: 'MTO',
        store: mtoData.store,
        emailId: emailResult.data?.id
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("❌ MTO NOTIFICATION - Email sending failed:", emailResult.error);
      
      // Log failed email
      await logEmailNotification({
        orderId: orderId,
        orderType: 'MTO',
        recipients: recipients,
        status: 'failed',
        notificationType: 'mto_order_submitted',
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
    console.error("❌ MTO NOTIFICATION - Error:", error);
    
    // Log error
    try {
      await logEmailNotification({
        orderId: 'unknown',
        orderType: 'MTO',
        recipients: [],
        status: 'failed',
        notificationType: 'mto_order_submitted',
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