
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailReply {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  messageId: string;
  inReplyTo?: string;
  references?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('📧 EMAIL REPLY WEBHOOK - Processing incoming email');
    
    const emailData: EmailReply = await req.json();
    console.log('📧 Email data received:', {
      from: emailData.from,
      subject: emailData.subject,
      inReplyTo: emailData.inReplyTo
    });

    // Extract clean message content from email (remove quoted text)
    const cleanMessage = extractCleanMessage(emailData.text || emailData.html || '');
    
    if (!cleanMessage.trim()) {
      console.log('❌ No clean message content found');
      return new Response(
        JSON.stringify({ error: 'No message content found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the original message thread using In-Reply-To header
    let orderId: string | null = null;
    let orderType: 'orders' | 'mto_orders' | 'wheel_orders' = 'orders';

    if (emailData.inReplyTo) {
      // Look up the original message by message_id
      const { data: originalMessage } = await supabase
        .from('order_messages')
        .select('order_id, order_type')
        .eq('message_id', emailData.inReplyTo)
        .single();

      if (originalMessage) {
        orderId = originalMessage.order_id;
        orderType = originalMessage.order_type;
        console.log('📧 Found original message thread:', { orderId, orderType });
      }
    }

    // If we can't find the thread via In-Reply-To, try to extract from subject
    if (!orderId) {
      const orderIdMatch = emailData.subject.match(/Order\s+#?(\w+)/i) || 
                          emailData.subject.match(/Re:.*Order\s+#?(\w+)/i);
      if (orderIdMatch) {
        orderId = orderIdMatch[1];
        console.log('📧 Extracted order ID from subject:', orderId);
      }
    }

    if (!orderId) {
      console.log('❌ Could not determine order ID from email');
      return new Response(
        JSON.stringify({ error: 'Could not determine order ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine sender role based on email domain or sender
    const senderRole = emailData.from.includes('@warehouse.') || 
                      emailData.from.includes('@maddenco.') ? 
                      'warehouse_admin' : 'store_manager';

    // Save the email reply to order_messages
    const { data: newMessage, error } = await supabase
      .from('order_messages')
      .insert({
        order_id: orderId,
        order_type: orderType,
        message_text: cleanMessage,
        sender_email: emailData.from,
        sender_role: senderRole,
        sender_name: extractSenderName(emailData.from),
        source: 'email_reply',
        reply_to_email_id: emailData.inReplyTo,
        message_id: emailData.messageId
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving email reply:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save message' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Email reply saved successfully:', newMessage.id);

    // If this is a reply from warehouse admin, send notification to store
    if (senderRole === 'warehouse_admin') {
      // Find the store manager email from the order
      const { data: orderData } = await supabase
        .from(orderType)
        .select('email, store')
        .eq('id', orderId)
        .single();

      if (orderData?.email) {
        // Send email notification to store manager
        await sendEmailNotification(orderData.email, orderId, cleanMessage, orderType);
      }
    }

    return new Response(
      JSON.stringify({ success: true, messageId: newMessage.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ EMAIL REPLY WEBHOOK ERROR:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractCleanMessage(content: string): string {
  // Remove common email signatures and quoted text
  const lines = content.split('\n');
  const cleanLines: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Stop at common reply indicators
    if (trimmedLine.startsWith('On ') && trimmedLine.includes('wrote:')) break;
    if (trimmedLine.startsWith('From:')) break;
    if (trimmedLine.startsWith('-----Original Message-----')) break;
    if (trimmedLine.startsWith('>')) break;
    if (trimmedLine.includes('-- ')) break;
    
    cleanLines.push(line);
  }
  
  return cleanLines.join('\n').trim();
}

function extractSenderName(email: string): string {
  const nameMatch = email.match(/^(.+?)\s*<.+@.+>$/);
  if (nameMatch) {
    return nameMatch[1].replace(/['"]/g, '').trim();
  }
  return email.split('@')[0];
}

async function sendEmailNotification(recipientEmail: string, orderId: string, message: string, orderType: string) {
  try {
    // This would integrate with your existing email service
    console.log('📧 Sending email notification to:', recipientEmail);
    // Implementation depends on your email service (Resend, etc.)
  } catch (error) {
    console.error('❌ Error sending email notification:', error);
  }
}
