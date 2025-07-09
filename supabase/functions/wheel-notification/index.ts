import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendEmail, createEmailTemplate, logEmailNotification } from "../_shared/mailer.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Contact system functions for getting email recipients
function getRefurbishedEmailRecipients(storeNumber: string): string[] {
  // Store Manager mappings
  const STORE_MANAGERS: Record<string, string> = {
    "22": "roderickdemarais@aol.com", // Fort Worth
    "27": "rdemarais@conlantire.com", // Grand Prairie
    "28": "jhughes@conlantire.com", // Houston
    "29": "rpetty@conlantire.com", // San Antonio
    "30": "dbaumgardner@conlantire.com", // OKC
    "32": "jmilliken@conlantire.com", // Little Rock
    "33": "rowilson@conlantire.com", // Kansas
    "35": "lguerra@conlantire.com", // Laredo
    "36": "kbrown@conlantire.com", // Tulsa
    "39": "borozco@conlantire.com", // Austin
    "007": "jriggins@conlantire.com", // Pompano Beach
    "009": "speetz@conlantire.com", // Fort Myers
    "003": "jvazquez@conlantire.com", // Miami
    "002": "tdouglas@conlantire.com", // Jacksonville
    "005": "kejensen@conlantire.com", // Ocala
    "015": "aechavarria@conlantire.com", // Tallahassee
    "001": "lparson@conlantire.com", // Mulberry Service
    "004": "jranoni@conlantire.com", // Orlando
    "023": "rlacross@conlantire.com", // Sarasota
    "006": "sfigueroa@conlantire.com", // Tampa
    "040": "dcespedes@conlantire.com", // Tampa Foam Fill
  };

  // Store to Plant mapping
  const STORE_TO_PLANT_MAP: Record<string, string> = {
    "22": "Grand Prairie 97", "27": "Grand Prairie 97", "28": "Grand Prairie 97", "29": "Grand Prairie 97",
    "30": "Grand Prairie 97", "32": "Grand Prairie 97", "33": "Grand Prairie 97", "35": "Grand Prairie 97",
    "36": "Grand Prairie 97", "39": "Grand Prairie 97",
    "003": "Mulberry 99", "007": "Mulberry 99", "009": "Mulberry 99", "002": "Mulberry 99",
    "005": "Mulberry 99", "015": "Mulberry 99", "001": "Mulberry 99", "004": "Mulberry 99",
    "006": "Mulberry 99", "023": "Mulberry 99", "040": "Mulberry 99"
  };

  // Plant personnel 
  const PLANT_PERSONNEL: Record<string, string[]> = {
    "Grand Prairie 97": [
      "nchilds@conlantire.com", // Nathan Childs - Warehouse Manager
      "rdemarais@conlantire.com", // Roderick Demarais - Warehouse Manager
      "gmoreno@conlantire.com" // Gerardo Moreno - Warehouse Coordinator
    ],
    "Mulberry 99": [
      "ogull@conlantire.com", // Omar Gull - Warehouse Manager
      "ewashington@conlantire.com", // Eddie Washington - Warehouse Coordinator
      "kbriglin@conlantire.com" // K. Briglin - Warehouse Coordinator
    ]
  };

  const emails: string[] = [];
  
  // Add store manager
  const storeManagerEmail = STORE_MANAGERS[storeNumber];
  if (storeManagerEmail) {
    emails.push(storeManagerEmail);
  }
  
  // Get plant personnel
  const plant = STORE_TO_PLANT_MAP[storeNumber];
  if (plant && PLANT_PERSONNEL[plant]) {
    emails.push(...PLANT_PERSONNEL[plant]);
  }
  
  return [...new Set(emails)]; // Remove duplicates
}

// Email notification for Wheel Orders
serve(async (req) => {
  console.log("🚀 WHEEL NOTIFICATION - Edge function called");
  console.log("🚀 WHEEL NOTIFICATION - Request method:", req.method);
  
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
    console.log("📧 WHEEL NOTIFICATION - Request body:", JSON.stringify(requestBody, null, 2));
    
    const { wheelData, orderId, recipients } = requestBody;
    
    console.log("📧 WHEEL NOTIFICATION - Processing wheel order:", orderId);
    console.log("📧 WHEEL NOTIFICATION - Recipients:", recipients);
    console.log("📧 WHEEL NOTIFICATION - Wheel data:", wheelData);

    // If recipients not provided, get them from contact system
    let emailRecipients = recipients;
    if (!recipients || recipients.length === 0) {
      // Extract store number from wheel data
      const storeNumber = wheelData.storeName?.match(/\d+$/)?.[0] || wheelData.store?.match(/\d+$/)?.[0];
      if (storeNumber) {
        emailRecipients = getRefurbishedEmailRecipients(storeNumber);
        console.log("📧 WHEEL NOTIFICATION - Retrieved email recipients from contact system:", emailRecipients);
      }
    }
    
    if (!emailRecipients || emailRecipients.length === 0) {
      console.log("⚠️ WHEEL NOTIFICATION - No email recipients available for wheel order:", orderId);
      
      // Log the attempt even if no recipients
      await logEmailNotification({
        orderId: orderId || 'unknown',
        orderType: 'WHEEL_POWDER_COATING',
        recipients: [],
        status: 'failed',
        notificationType: 'wheel_order_submitted',
        errorMessage: 'No recipients available'
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients available',
        orderId: orderId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create standardized email using the new template system
    const emailSubject = `Wheel Order - ${wheelData.storeName || wheelData.store} - ${wheelData.wheelColor} ${wheelData.wheelSize}`;
    
    const orderDetails = {
      store: wheelData.storeName || wheelData.store,
      customerName: wheelData.customerName,
      wheelMaterial: wheelData.wheelMaterial,
      wheelType: wheelData.wheelType,
      handHoles: wheelData.handHoles,
      wheelSize: wheelData.wheelSize,
      wheelColor: wheelData.wheelColor,
      quantity: wheelData.qtyWheels,
      dateReceived: wheelData.dateReceived,
      scheduleArrival: wheelData.scheduleArrival
    };

    const emailBody = createEmailTemplate({
      orderType: 'Wheel Powder Coating',
      orderDetails: orderDetails,
      submitterInfo: {
        name: wheelData.yourName || wheelData.name,
        email: wheelData.managersEmail || wheelData.email
      },
      orderId: orderId,
      isCrossDock: false // Wheel orders are not cross-dock
    });

    console.log("📧 WHEEL NOTIFICATION - Sending email via centralized mailer to:", emailRecipients);
    console.log("📧 WHEEL NOTIFICATION - Email subject:", emailSubject);
    
    // Send email via centralized mailer (Resend)
    const emailResult = await sendEmail({
      to: emailRecipients,
      subject: emailSubject,
      html: emailBody
    });

    if (emailResult.success) {
      console.log("✅ WHEEL NOTIFICATION - Email sent successfully via Resend:", emailResult.data);
      
      // Log successful email
      await logEmailNotification({
        orderId: orderId,
        orderType: 'WHEEL_POWDER_COATING',
        recipients: emailResult.sentTo || emailRecipients,
        status: 'sent',
        notificationType: 'wheel_order_submitted',
        emailProvider: 'resend'
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Wheel order notification sent successfully via Resend',
        recipients: (emailResult.sentTo || emailRecipients).length,
        orderId: orderId,
        orderType: 'WHEEL_POWDER_COATING',
        store: wheelData.storeName || wheelData.store,
        emailId: emailResult.data?.id
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error("❌ WHEEL NOTIFICATION - Email sending failed:", emailResult.error);
      
      // Log failed email
      await logEmailNotification({
        orderId: orderId,
        orderType: 'WHEEL_POWDER_COATING',
        recipients: emailRecipients,
        status: 'failed',
        notificationType: 'wheel_order_submitted',
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
    console.error("❌ WHEEL NOTIFICATION - Error:", error);
    
    // Log error
    try {
      await logEmailNotification({
        orderId: 'unknown',
        orderType: 'WHEEL_POWDER_COATING',
        recipients: [],
        status: 'failed',
        notificationType: 'wheel_order_submitted',
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