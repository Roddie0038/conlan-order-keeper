
import { supabase } from "@/integrations/supabase/client";
import type { OrderMessage } from "./types";

/**
 * Send email notification for a new message
 */
export const sendEmailNotification = async (message: OrderMessage): Promise<void> => {
  try {
    console.log("📧 Sending email notification for message:", message.id);
    
    // Determine recipient based on sender role
    const isFromWarehouse = message.sender_role === 'warehouse_admin';
    
    // Get order details to find recipient email
    let recipientEmail: string | null = null;
    let orderDetails: any = null;

    const { data: orderData } = await supabase
      .from(message.order_type)
      .select('*')
      .eq('id', message.order_id)
      .single();

    if (orderData) {
      orderDetails = orderData;
      recipientEmail = isFromWarehouse ? orderData.email : 'warehouse@maddenco.com';
    }

    if (!recipientEmail || !orderDetails) {
      console.error("❌ Could not determine recipient email");
      return;
    }

    // Generate message threading ID for email
    const messageId = message.message_id || `msg-${Date.now()}-${message.id}`;
    
    // Create email content with reply options
    const emailSubject = `Order #${orderDetails.product_number || orderDetails.id} - New Message`;
    const platformLink = `${window.location.origin}/order-management?order=${message.order_id}&type=${message.order_type}`;
    
    const emailHtml = generateEmailTemplate({
      message,
      orderDetails,
      platformLink,
      messageId,
      isReply: !!message.reply_to_email_id
    });

    // Send email via your email service
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
        messageId: messageId,
        inReplyTo: message.reply_to_email_id,
        replyTo: 'orders-noreply@maddenco.com' // Configure for email replies
      })
    });

    // Mark message as email sent
    await supabase
      .from('order_messages')
      .update({ email_sent: true })
      .eq('id', message.id);

    console.log("✅ Email notification sent successfully");

  } catch (error) {
    console.error("❌ Error sending email notification:", error);
  }
};

/**
 * Generate email template with reply options
 */
function generateEmailTemplate({ message, orderDetails, platformLink, messageId, isReply }: {
  message: OrderMessage;
  orderDetails: any;
  platformLink: string;
  messageId: string;
  isReply: boolean;
}): string {
  const senderName = message.sender_name || message.sender_email;
  const senderType = message.sender_role === 'warehouse_admin' ? 'Warehouse Team' : 'Store Manager';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">
          ${isReply ? 'Reply to' : 'New Message'} - Order #${orderDetails.product_number || orderDetails.id}
        </h2>
        <p style="color: #666; margin: 5px 0 0 0;">
          From: ${senderName} (${senderType})
        </p>
      </div>
      
      <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; line-height: 1.6;">
          ${message.message_text.replace(/\n/g, '<br>')}
        </p>
      </div>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1976d2; margin: 0 0 15px 0;">How to Reply:</h3>
        
        <div style="margin-bottom: 15px;">
          <strong>Option 1: Reply directly to this email</strong>
          <p style="margin: 5px 0; color: #666;">
            Simply reply to this email and your message will be added to the conversation.
          </p>
        </div>
        
        <div>
          <strong>Option 2: Reply on the platform</strong>
          <p style="margin: 5px 0 10px 0; color: #666;">
            View the full conversation and reply online:
          </p>
          <a href="${platformLink}" 
             style="background: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            View & Reply on Platform
          </a>
        </div>
      </div>
      
      <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 12px;">
        <p>Order Details:</p>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Store: ${orderDetails.store}</li>
          <li>Product: ${orderDetails.product_number}</li>
          <li>Description: ${orderDetails.description}</li>
        </ul>
      </div>
    </div>
  `;
}
