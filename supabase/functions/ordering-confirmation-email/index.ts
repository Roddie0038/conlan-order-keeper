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
  recipients?: string[]; // Direct recipient list from NotificationController
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
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'conlantireorders@conlanorders.com';

    const orderData: OrderData = await req.json();
    console.log('📧 EDGE FUNCTION - Processing order confirmation email:', {
      order_id: orderData.order_id,
      order_type: orderData.order_type,
      store: orderData.store_name,
      recipients_count: orderData.recipients?.length || 0
    });

    // Strict domain enforcement - only @conlantire.com and @aol.com
    const ALLOWED_DOMAINS = ['conlantire.com', 'aol.com'];
    
    let recipients: string[] = [];
    
    if (orderData.recipients && Array.isArray(orderData.recipients)) {
      // Use recipients provided by NotificationController (already filtered)
      recipients = orderData.recipients;
    } else {
      // Fallback: resolve recipients and apply domain filtering
      const resolvedRecipients = await getEmailRecipients(supabase, orderData.store_number, orderData.order_type, orderData.plant);
      recipients = resolvedRecipients
        .map(r => r.email)
        .filter(email => {
          const domain = email.split('@')[1];
          return ALLOWED_DOMAINS.includes(domain);
        });
    }
    
    // Final domain filter enforcement (double-check)
    recipients = recipients.filter(email => {
      const domain = email.split('@')[1];
      const isAllowed = ALLOWED_DOMAINS.includes(domain);
      if (!isAllowed) {
        console.log(`🚫 EDGE FUNCTION - Blocked recipient ${email} (domain: ${domain})`);
      }
      return isAllowed;
    });

    console.log(`📧 ORDER EMAIL - Sending to ${recipients.length} allowed recipients`);

    if (recipients.length === 0) {
      console.log('⚠️ ORDER EMAIL - No allowed recipients after domain filtering');
      return new Response(JSON.stringify({
        success: true,
        message: 'No allowed recipients after domain filtering',
        sent_count: 0
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Generate email content
    const subject = generateEmailSubject(orderData);
    const emailBody = generateEmailBody(orderData);

    // Send emails to all allowed recipients
    const emailResults = [];
    
    for (const recipientEmail of recipients) {
      try {
        const emailResponse = await resend.emails.send({
          from: fromEmail,
          to: [recipientEmail],
          subject: subject,
          html: emailBody,
        });

        console.log(`✅ ORDER EMAIL - Sent to ${recipientEmail}`);
        
        // Log successful delivery
        await logEmailDelivery(supabase, orderData, recipientEmail, 'sent', emailResponse.data?.id);
        
        emailResults.push({ 
          email: recipientEmail,
          status: 'sent',
          message_id: emailResponse.data?.id 
        });

      } catch (emailError) {
        console.error(`❌ ORDER EMAIL - Failed to send to ${recipientEmail}:`, emailError);
        
        // Log failed delivery
        await logEmailDelivery(supabase, orderData, recipientEmail, 'failed', null, emailError.message);
        
        emailResults.push({ 
          email: recipientEmail,
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
 * Get email recipients using role-based routing logic (fallback only)
 */
async function getEmailRecipients(
  supabase: any, 
  storeNumber: string, 
  orderType: string, 
  plant?: string
): Promise<{ email: string; name?: string; role: string }[]> {
  
  console.log(`🔍 EMAIL RECIPIENTS - Fallback lookup for store: ${storeNumber}, type: ${orderType}`);
  
  // Generate store variants
  const storeVariants = [storeNumber];
  if (storeNumber.length === 1) {
    storeVariants.push(`0${storeNumber}`, `00${storeNumber}`);
  } else if (storeNumber.length === 2) {
    storeVariants.push(`0${storeNumber}`);
  }
  
  // Try ordering_email_recipients table first
  const { data: databaseRecipients, error: dbError } = await supabase
    .from('ordering_email_recipients')
    .select('*')
    .or(`store_number.in.(${storeVariants.join(',')}),plant.eq.${plant || 'Grand Prairie 097'}`)
    .eq('is_active', true);

  if (!dbError && databaseRecipients && databaseRecipients.length > 0) {
    console.log(`✅ EMAIL RECIPIENTS - Found ${databaseRecipients.length} database recipients`);
    
    const filteredRecipients = databaseRecipients.filter(recipient => {
      if (recipient.notification_types && Array.isArray(recipient.notification_types)) {
        return recipient.notification_types.includes(orderType);
      }
      return false;
    });
    
    return filteredRecipients.map(r => ({
      email: r.recipient_email,
      name: r.store_name || r.plant,
      role: r.role
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
    role: r.role
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
    'operations_manager': ['warranty', 'complaint'],
    'super_admin': ['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint', 'completion', 'out_of_stock', 'message']
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
    'complaint': 'Customer Complaint',
    'cross_dock': 'Cross-Dock Order'
  };
  
  const orderTypeName = orderTypeMap[orderData.order_type] || 'Order';
  return `✅ ${orderTypeName} Confirmation – Order #${orderData.order_id}`;
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
        <title>Order Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background-color: #007bff; color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
            .detail-row { margin-bottom: 12px; }
            .detail-label { font-weight: bold; display: inline-block; width: 140px; color: #495057; }
            .detail-value { color: #212529; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #6c757d; }
            .highlight { background-color: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmation</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your ${orderData.order_type.toUpperCase()} order has been received</p>
            </div>
            
            <div class="content">
                <div class="highlight">
                    <strong>✅ Order #${orderData.order_id} confirmed</strong><br>
                    Submitted on ${new Date(orderData.timestamp).toLocaleDateString()} at ${new Date(orderData.timestamp).toLocaleTimeString()}
                </div>
                
                <div class="order-details">
                    <h3 style="margin-top: 0; color: #374151; border-bottom: 2px solid #007bff; padding-bottom: 8px;">Order Information</h3>
                    
                    <div class="detail-row">
                        <span class="detail-label">Order Type:</span>
                        <span class="detail-value">${orderData.order_type.toUpperCase()}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Store:</span>
                        <span class="detail-value">${orderData.store_name}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Submitted By:</span>
                        <span class="detail-value">${orderData.name}</span>
                    </div>
                    
                    <div class="detail-row">
                        <span class="detail-label">Contact Email:</span>
                        <span class="detail-value">${orderData.email}</span>
                    </div>
                    
                    ${orderData.plant ? `
                    <div class="detail-row">
                        <span class="detail-label">Plant:</span>
                        <span class="detail-value">${orderData.plant}</span>
                    </div>
                    ` : ''}
                    
                    ${orderData.product_number ? `
                    <div class="detail-row">
                        <span class="detail-label">Product:</span>
                        <span class="detail-value">${orderData.product_number}</span>
                    </div>
                    ` : ''}
                    
                    ${orderData.description ? `
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${orderData.description}</span>
                    </div>
                    ` : ''}
                    
                    ${orderData.quantity ? `
                    <div class="detail-row">
                        <span class="detail-label">Quantity:</span>
                        <span class="detail-value">${orderData.quantity}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div style="background-color: #d4edda; padding: 15px; border-radius: 6px; border-left: 4px solid #28a745;">
                    <strong style="color: #155724;">What's Next?</strong><br>
                    <span style="color: #155724;">Your order is now being processed. You will receive additional notifications as it progresses through our fulfillment process. No further action is required at this time.</span>
                </div>
            </div>
            
            <div class="footer">
                <p style="margin: 0 0 10px 0;"><strong>Conlan Tire Ordering System</strong></p>
                <p style="margin: 0;">This is an automated confirmation. Please do not reply to this email.</p>
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
  recipientEmail: string,
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
        email_type: 'order_confirmation',
        store_number: orderData.store_number,
        recipient_email: recipientEmail,
        status: status,
        response: messageId ? `Resend ID: ${messageId}` : null,
        error_details: errorMessage
      });
  } catch (error) {
    console.error('❌ EMAIL LOG - Failed to log delivery:', error);
  }
}