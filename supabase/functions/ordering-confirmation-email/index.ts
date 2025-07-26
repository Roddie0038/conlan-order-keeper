import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OrderData Interface
interface OrderData {
  store_number: string;
  store_name: string;
  order_type: string;
  order_id: string;
  timestamp: string;
  name: string;
  email: string;
  quantity?: number;
  product_number?: string;
  description?: string;
  plant?: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
  role: string;
  store?: string;
  plant?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize Resend
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';

    const orderData: OrderData = await req.json();
    console.log('📧 EDGE FUNCTION - Processing order confirmation email for:', orderData);

    // Extract store number from store_name if store_number is missing
    let storeNumber = orderData.store_number;
    if (!storeNumber && orderData.store_name) {
      const match = orderData.store_name.match(/(\d+)/);
      storeNumber = match ? match[1] : '';
    }

    if (!storeNumber) {
      throw new Error('Could not determine store number from order data');
    }

    // Get email recipients using role-based routing
    const recipients = await getEmailRecipients(supabase, storeNumber, orderData.order_type, orderData.plant);
    
    console.log(`📧 ORDER EMAIL - Found ${recipients.length} recipients for ${orderData.order_type} notification`);

    if (recipients.length === 0) {
      console.log('⚠️ ORDER EMAIL - No recipients found, skipping email');
      return new Response(JSON.stringify({
        success: true,
        message: 'No recipients configured for this order type and store',
        sent_count: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate email content
    const subject = `✅ Order Confirmation – ${orderData.order_type} Order Received`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Order Confirmation</h2>
          
          <p style="margin-bottom: 15px;">Hi ${orderData.store_name} team,</p>
          
          <p style="margin-bottom: 20px;">This is to confirm that your <strong>${orderData.order_type}</strong> order has been received and is being processed.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Order Details:</h3>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Order Type:</strong> ${orderData.order_type}</li>
              <li><strong>Order ID:</strong> ${orderData.order_id}</li>
              <li><strong>Store:</strong> ${orderData.store_name} (#${storeNumber})</li>
              <li><strong>Submitted by:</strong> ${orderData.name} (${orderData.email})</li>
              <li><strong>Submitted at:</strong> ${new Date(orderData.timestamp).toLocaleString()}</li>
              ${orderData.quantity ? `<li><strong>Quantity:</strong> ${orderData.quantity}</li>` : ''}
              ${orderData.product_number ? `<li><strong>Product:</strong> ${orderData.product_number}</li>` : ''}
              ${orderData.description ? `<li><strong>Description:</strong> ${orderData.description}</li>` : ''}
            </ul>
          </div>
          
          <p style="margin-bottom: 20px;">No further action is needed at this time. You will receive additional notifications as your order progresses through our fulfillment process.</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            This is an automated message from the Conlan Tire Ordering System.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    // Send emails to all recipients
    const emailResults = [];
    
    for (const recipient of recipients) {
      try {
        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [recipient.email],
          subject: subject,
          html: htmlBody,
        });

        console.log(`✅ ORDER EMAIL - Sent to ${recipient.email} (${recipient.role})`);
        
        // Log successful delivery
        await logEmailDelivery(supabase, orderData, recipient, 'sent', emailResponse.data?.id);
        
        emailResults.push({ 
          email: recipient.email, 
          role: recipient.role,
          status: 'sent',
          message_id: emailResponse.data?.id 
        });

      } catch (emailError) {
        console.error(`❌ ORDER EMAIL - Failed to send to ${recipient.email}:`, emailError);
        
        // Log failed delivery
        await logEmailDelivery(supabase, orderData, recipient, 'failed', null, emailError.message);
        
        emailResults.push({ 
          email: recipient.email, 
          role: recipient.role,
          status: 'failed',
          error: emailError.message 
        });
      }
    }

    const successCount = emailResults.filter(r => r.status === 'sent').length;
    const failureCount = emailResults.filter(r => r.status === 'failed').length;

    console.log(`📊 ORDER EMAIL - Results: ${successCount} sent, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      message: `Email notifications processed for ${orderData.order_type} order`,
      sent_count: successCount,
      failed_count: failureCount,
      results: emailResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('❌ ORDER EMAIL - Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});

/**
 * Get email recipients using role-based routing logic
 */
async function getEmailRecipients(
  supabase: any, 
  storeNumber: string, 
  orderType: string, 
  plant?: string
): Promise<EmailRecipient[]> {
  
  console.log(`🔍 EMAIL RECIPIENTS - Looking up for store: ${storeNumber}, type: ${orderType}, plant: ${plant}`);
  
  // Generate store variants (e.g., "22", "022", "Store 022")
  const storeVariants = [storeNumber];
  if (storeNumber.length === 1) {
    storeVariants.push(`0${storeNumber}`, `00${storeNumber}`);
  } else if (storeNumber.length === 2) {
    storeVariants.push(`0${storeNumber}`);
  }
  
  // First try ordering_email_recipients table
  const { data: databaseRecipients, error: dbError } = await supabase
    .from('ordering_email_recipients')
    .select('*')
    .or(`store_number.in.(${storeVariants.join(',')}),plant.eq.${plant || 'Grand Prairie 097'}`)
    .eq('is_active', true);

  if (!dbError && databaseRecipients && databaseRecipients.length > 0) {
    console.log(`✅ EMAIL RECIPIENTS - Found ${databaseRecipients.length} database recipients`);
    
    // Filter based on role and notification type
    const filteredRecipients = databaseRecipients.filter(recipient => {
      if (recipient.notification_types && Array.isArray(recipient.notification_types)) {
        return recipient.notification_types.includes(orderType);
      }
      return false;
    });
    
    return filteredRecipients.map(r => ({
      email: r.recipient_email,
      name: r.store_name || r.plant,
      role: r.role,
      store: r.store_name,
      plant: r.plant
    }));
  }

  // Fallback to ot_platform_users
  console.log(`⚠️ EMAIL RECIPIENTS - No database recipients, trying ot_platform_users fallback`);
  
  const { data: fallbackRecipients, error: fbError } = await supabase
    .from('ot_platform_users')
    .select('email, full_name, role, store, plant')
    .or(`store.in.(${storeVariants.join(',')}),plant.eq.${plant || 'Grand Prairie 097'}`)
    .eq('status', 'active')
    .not('email', 'is', null);

  if (fbError) {
    console.error(`❌ EMAIL RECIPIENTS - Fallback error:`, fbError);
    return [];
  }

  const fallbackFiltered = (fallbackRecipients || []).filter(recipient => {
    return shouldIncludeRecipientByRole(recipient.role, orderType);
  });

  console.log(`📧 EMAIL RECIPIENTS - Fallback found ${fallbackFiltered.length} recipients`);

  return fallbackFiltered.map(r => ({
    email: r.email,
    name: r.full_name,
    role: r.role,
    store: r.store,
    plant: r.plant
  }));
}

/**
 * Role-based inclusion logic
 */
function shouldIncludeRecipientByRole(role: string, orderType: string): boolean {
  const roleRules = {
    'store_manager': ['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint', 'completion', 'out_of_stock', 'message'],
    'service_manager': ['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint', 'completion', 'out_of_stock', 'message'],
    'warehouse_manager': ['transfer', 'cross_dock', 'mto', 'wheel', 'complaint', 'completion', 'out_of_stock', 'message'],
    'warehouse_coordinator': ['transfer', 'cross_dock', 'mto', 'wheel', 'completion', 'out_of_stock', 'message'],
    'retread_manager': ['mto', 'warranty', 'complaint'],
    'plant_manager': ['warranty', 'complaint'],
    'operations_manager': ['warranty', 'complaint']
  };
  
  const allowedTypes = roleRules[role] || [];
  return allowedTypes.includes(orderType);
}

/**
 * Generate email subject based on order type
 */
function generateEmailSubject(orderData: OrderData): string {
  const orderTypeMap = {
    'transfer': 'Transfer Order',
    'mto': 'MTO Order', 
    'wheel': 'Wheel Order',
    'warranty': 'Warranty Claim',
    'complaint': 'Customer Complaint'
  };
  
  const orderTypeName = orderTypeMap[orderData.order_type] || 'Order';
  return `${orderTypeName} Notification - ${orderData.store_name} - Order #${orderData.order_id}`;
}

/**
 * Generate email body HTML
 */
function generateEmailBody(orderData: OrderData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Notification</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
            .order-details { background-color: #ffffff; border: 1px solid #e9ecef; padding: 20px; border-radius: 5px; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
            h1 { color: #007bff; margin-bottom: 10px; }
            h2 { color: #495057; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
            .detail-row { margin-bottom: 10px; }
            .detail-label { font-weight: bold; display: inline-block; width: 150px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${generateEmailSubject(orderData)}</h1>
                <p>A new ${orderData.order_type} order has been submitted and requires your attention.</p>
            </div>
            
            <div class="order-details">
                <h2>Order Information</h2>
                <div class="detail-row">
                    <span class="detail-label">Order ID:</span>
                    ${orderData.order_id}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Order Type:</span>
                    ${orderData.order_type.toUpperCase()}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Store:</span>
                    ${orderData.store_name}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Submitted By:</span>
                    ${orderData.name}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    ${orderData.email}
                </div>
                <div class="detail-row">
                    <span class="detail-label">Timestamp:</span>
                    ${orderData.timestamp}
                </div>
                ${orderData.product_number ? `
                <div class="detail-row">
                    <span class="detail-label">Product Number:</span>
                    ${orderData.product_number}
                </div>
                ` : ''}
                ${orderData.description ? `
                <div class="detail-row">
                    <span class="detail-label">Description:</span>
                    ${orderData.description}
                </div>
                ` : ''}
                ${orderData.quantity ? `
                <div class="detail-row">
                    <span class="detail-label">Quantity:</span>
                    ${orderData.quantity}
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p>This is an automated notification from the Conlan Tire Ordering System.</p>
                <p>Please do not reply to this email. If you have questions, contact your system administrator.</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

/**
 * Log email delivery to database
 */
async function logEmailDelivery(
  supabase: any, 
  orderData: OrderData, 
  recipient: EmailRecipient, 
  status: string, 
  messageId?: string, 
  errorMessage?: string
): Promise<void> {
  try {
    await supabase
      .from('ordering_email_logs')
      .insert({
        order_id: orderData.order_id,
        order_type: orderData.order_type,
        email_type: orderData.order_type,
        store_number: orderData.store_number,
        recipient_email: recipient.email,
        status: status,
        response: messageId ? `Message ID: ${messageId}` : null,
        error_details: errorMessage
      });
  } catch (error) {
    console.error('❌ EMAIL LOG - Failed to log delivery:', error);
  }
}