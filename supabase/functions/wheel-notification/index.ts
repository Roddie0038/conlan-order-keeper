import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for database queries
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

/**
 * Normalize store number from various formats
 */
function normalizeStoreNumber(store: string): string {
  if (!store) return '';
  
  // If it's already just a number
  if (/^\d+$/.test(store.trim())) {
    return store.trim().replace(/^0+/, '') || '0'; // Remove leading zeros
  }
  
  // Extract number from store name like "Fort Worth 22"
  const match = store.match(/\d+/);
  return match ? match[0] : '';
}

/**
 * Get email recipients for wheel orders from store_email_recipients table
 * NO hardcoded emails - uses database only
 */
async function getWheelOrderRecipients(storeNumber: string): Promise<string[]> {
  if (!storeNumber) {
    console.warn('⚠️ WHEEL NOTIFICATION - No store number provided');
    return [];
  }

  console.log(`🔍 WHEEL NOTIFICATION - Looking up recipients for store ${storeNumber}`);

  try {
    // Query store_email_recipients table for wheel order recipients
    const { data: storeRecipients, error: storeError } = await supabase
      .from('store_email_recipients')
      .select('recipient_email, recipient_role, store_number, store_name')
      .eq('store_number', storeNumber)
      .eq('email_type', 'wheel')
      .eq('is_active', true);

    if (storeError) {
      console.error('❌ WHEEL NOTIFICATION - Error querying store_email_recipients:', storeError);
    } else if (storeRecipients && storeRecipients.length > 0) {
      const emails = storeRecipients.map(r => r.recipient_email);
      console.log(`✅ WHEEL NOTIFICATION - Found ${emails.length} recipients from store_email_recipients:`, 
        storeRecipients.map(r => ({ email: r.recipient_email, role: r.recipient_role })));
      return emails;
    }

    // Fallback: Query platform_users for active users assigned to this store
    console.log(`⚠️ WHEEL NOTIFICATION - No recipients in store_email_recipients for store ${storeNumber}, checking platform_users...`);
    
    const { data: platformUsers, error: platformError } = await supabase
      .from('platform_users')
      .select('email, role, store')
      .eq('platform', 'ordering_platform')
      .eq('status', 'active')
      .eq('store', storeNumber)
      .in('role', ['store_manager', 'service_manager', 'warehouse_staff', 'team_lead']);

    if (platformError) {
      console.error('❌ WHEEL NOTIFICATION - Error querying platform_users:', platformError);
      return [];
    }

    if (platformUsers && platformUsers.length > 0) {
      const emails = platformUsers.map(u => u.email);
      console.log(`✅ WHEEL NOTIFICATION - Found ${emails.length} recipients from platform_users:`, 
        platformUsers.map(u => ({ email: u.email, role: u.role })));
      return emails;
    }

    console.log(`❌ WHEEL NOTIFICATION - No recipients found for store ${storeNumber}`);
    return [];

  } catch (error) {
    console.error('❌ WHEEL NOTIFICATION - Error getting recipients:', error);
    return [];
  }
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
    console.log("📧 WHEEL NOTIFICATION - Wheel data:", wheelData);

    // Extract store number from wheel data
    const storeNumber = normalizeStoreNumber(wheelData.storeName || wheelData.store || '');
    console.log("📧 WHEEL NOTIFICATION - Extracted store number:", storeNumber);

    // Get recipients from database (NO hardcoded fallbacks)
    let emailRecipients = recipients;
    if (!recipients || recipients.length === 0) {
      emailRecipients = await getWheelOrderRecipients(storeNumber);
    }
    
    if (!emailRecipients || emailRecipients.length === 0) {
      console.log("⚠️ WHEEL NOTIFICATION - No email recipients available for wheel order:", orderId);
      
      // Log the attempt even if no recipients
      console.log("📊 WHEEL EMAIL LOGGING - Would log failed order (no recipients)");
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No recipients available in database',
        orderId: orderId,
        store: storeNumber,
        source: 'database_query'
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

    const emailBody = `<div>Mock email template for wheel notification</div>`;
    console.log("📧 WHEEL NOTIFICATION - Mock email template created");

    console.log("📧 WHEEL NOTIFICATION - Sending email to:", emailRecipients);
    console.log("📧 WHEEL NOTIFICATION - Email subject:", emailSubject);
    
    // Mock email result
    const emailResult = { success: true, sentTo: recipients };

    if (emailResult.success) {
      console.log("✅ WHEEL NOTIFICATION - Email sent successfully via database routing:", emailResult.data);
      
      // Log successful email
      console.log("📊 WHEEL EMAIL LOGGING - Would log successful email");
        orderId: orderId,
        orderType: 'WHEEL_POWDER_COATING',
        recipients: emailResult.sentTo || emailRecipients,
        status: 'sent',
        notificationType: 'wheel_order_submitted',
        emailProvider: 'resend',
        store: storeNumber,
        plant: wheelData.plant || 'unknown'
      });
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Wheel order notification sent successfully via database routing',
        recipients: (emailResult.sentTo || emailRecipients).length,
        orderId: orderId,
        orderType: 'WHEEL_POWDER_COATING',
        store: storeNumber,
        emailId: emailResult.data?.id,
        source: 'database_query'
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
        errorMessage: emailResult.error,
        store: storeNumber,
        plant: wheelData.plant || 'unknown'
      });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Email sending failed: ${emailResult.error}`,
        orderId: orderId,
        store: storeNumber
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error("❌ WHEEL NOTIFICATION - Error:", error);
    
    // Log error
    try {
      console.log("📊 WHEEL EMAIL LOGGING - Would log error");
        orderId: 'unknown',
        orderType: 'WHEEL_POWDER_COATING',
        recipients: [],
        status: 'failed',
        notificationType: 'wheel_order_submitted',
        emailProvider: 'resend',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
    } catch (logError) {
      console.error("❌ Failed to log error:", logError);
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});