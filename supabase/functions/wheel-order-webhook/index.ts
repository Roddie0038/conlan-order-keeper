
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

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
          
          // Call the wheel notification function
          const emailResponse = await fetch(
            `https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/wheel-notification`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
              },
              body: JSON.stringify({
                wheelData: wheelOrderData,
                orderId: crypto.randomUUID(), // Generate a UUID for tracking
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
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
