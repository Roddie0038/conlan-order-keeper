import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // PHASE 2: Enhanced Store Number Extraction
    let storeNumber = orderData.store_number;
    if (!storeNumber && orderData.store_name) {
      // Extract number from store name
      const match = orderData.store_name.match(/\d+/);
      storeNumber = match ? match[0] : '';
    }

    console.log('📧 EDGE FUNCTION - Store number extraction:', {
      original_store_number: orderData.store_number,
      store_name: orderData.store_name,
      extracted_store_number: storeNumber
    });

    // PHASE 3: Dynamic Recipients from platform_users (PRIMARY) with ordering_email_recipients fallback
    let recipients = [];
    let recipientsError = null;

    console.log('📧 EDGE FUNCTION - Querying recipients for store:', storeNumber);

    // PRIMARY: Query platform_users for current active users by store and role
    const { data: platformUsers, error: platformError } = await supabase
      .from('platform_users')
      .select('email, role, store')
      .eq('platform', 'ordering_platform')
      .eq('status', 'active')
      .eq('store', storeNumber);

    console.log('📧 EDGE FUNCTION - Platform users query result:', {
      store_number: storeNumber,
      platform_users_found: platformUsers?.length || 0,
      platform_users: platformUsers?.map(u => ({ email: u.email, role: u.role, store: u.store }))
    });

    if (platformError) {
      console.error('📧 EDGE FUNCTION - Error querying platform_users:', platformError);
      recipientsError = platformError;
    } else if (platformUsers && platformUsers.length > 0) {
      // Convert platform_users format to match recipients interface
      recipients = platformUsers.map(user => ({
        recipient_email: user.email,
        role: user.role,
        store_number: user.store,
        is_active: true,
        email_type: 'order_confirmation'
      }));
      console.log('📧 EDGE FUNCTION - Using platform_users recipients:', recipients.length);
    } else {
      // FALLBACK: Try ordering_email_recipients table
      console.log('📧 EDGE FUNCTION - No platform_users found, trying ordering_email_recipients fallback');
      
      const { data: exactRecipients, error: exactError } = await supabase
        .from('ordering_email_recipients')
        .select('*')
        .eq('store_number', storeNumber)
        .eq('is_active', true)
        .eq('email_type', 'order_confirmation');

      if (exactError) {
        console.error('📧 EDGE FUNCTION - Error in exact query:', exactError);
        recipientsError = exactError;
      } else if (exactRecipients && exactRecipients.length > 0) {
        recipients = exactRecipients;
        console.log('📧 EDGE FUNCTION - Found recipients with exact match:', recipients.length);
      } else {
        // Try with zero-padded format (e.g., "22" → "022")
        const paddedStoreNumber = storeNumber.padStart(3, '0');
        console.log('📧 EDGE FUNCTION - Trying padded store number:', paddedStoreNumber);
        
        const { data: paddedRecipients, error: paddedError } = await supabase
          .from('ordering_email_recipients')
          .select('*')
          .eq('store_number', paddedStoreNumber)
          .eq('is_active', true)
          .eq('email_type', 'order_confirmation');

        if (paddedError) {
          console.error('📧 EDGE FUNCTION - Error in padded query:', paddedError);
          recipientsError = paddedError;
        } else if (paddedRecipients && paddedRecipients.length > 0) {
          recipients = paddedRecipients;
          console.log('📧 EDGE FUNCTION - Found recipients with padded match:', recipients.length);
        } else {
          console.log('📧 EDGE FUNCTION - No recipients found in either table for store:', storeNumber);
        }
      }
    }

    // Also include the submitting user if they have a valid email
    if (orderData.email && orderData.email.includes('@')) {
      const submitterExists = recipients.some(r => r.recipient_email === orderData.email);
      if (!submitterExists) {
        recipients.push({
          recipient_email: orderData.email,
          role: 'submitter',
          store_number: storeNumber,
          is_active: true,
          email_type: 'order_confirmation'
        });
        console.log('📧 EDGE FUNCTION - Added submitting user to recipients:', orderData.email);
      }
    }

    if (recipientsError) {
      console.error('Error fetching email recipients:', recipientsError);
      throw recipientsError;
    }

    if (!recipients || recipients.length === 0) {
      console.log(`No email recipients found for store ${storeNumber}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `No email recipients configured for store ${storeNumber}` 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📧 EDGE FUNCTION - Final recipients list:', {
      store_number: storeNumber,
      recipients_count: recipients.length,
      recipient_emails: recipients.map(r => ({ email: r.recipient_email, role: r.role })),
      source: (platformUsers?.length ?? 0) > 0 ? 'platform_users' : 'ordering_email_recipients'
    });

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
        console.log(`Sending email to ${recipient.recipient_email} for store ${storeNumber}`);
        
        const emailResponse = await resend.emails.send({
          from: `Conlan Tire System <${fromEmail}>`,
          to: [recipient.recipient_email],
          subject: subject,
          html: emailBody,
        });

        console.log(`Email sent successfully to ${recipient.recipient_email}:`, emailResponse);
        
        // Log success
        await supabase.from('ordering_email_logs').insert({
          store_number: storeNumber,
          recipient_email: recipient.recipient_email,
          email_type: 'order_confirmation',
          order_type: orderData.order_type,
          order_id: orderData.order_id,
          status: 'success',
          response: JSON.stringify(emailResponse)
        });

        emailResults.push({
          recipient: recipient.recipient_email,
          success: true,
          messageId: (emailResponse as any).id
        });

      } catch (emailError) {
        console.error(`Error sending email to ${recipient.recipient_email}:`, emailError);
        
        // Log failure
        await supabase.from('ordering_email_logs').insert({
          store_number: storeNumber,
          recipient_email: recipient.recipient_email,
          email_type: 'order_confirmation',
          order_type: orderData.order_type,
          order_id: orderData.order_id,
          status: 'failed',
          error_details: (emailError as Error).message
        });

        emailResults.push({
          recipient: recipient.recipient_email,
          success: false,
          error: (emailError as Error).message
        });
      }
    }

    const successCount = emailResults.filter(r => r.success).length;
    const totalCount = emailResults.length;

    console.log(`Email sending complete: ${successCount}/${totalCount} successful`);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: `Sent ${successCount}/${totalCount} confirmation emails`,
        results: emailResults
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in ordering-confirmation-email function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: (error as Error).message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});