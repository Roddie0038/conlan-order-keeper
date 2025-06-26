
import { supabase } from "@/integrations/supabase/client";
import { getTransferEmailRecipients, getMTOEmailRecipients } from "@/config/contactSystem";

export interface OrderMessage {
  id: string;
  order_id: string;
  order_type: 'orders' | 'mto_orders' | 'wheel_orders';
  message_text: string;
  sender_email: string;
  sender_role: 'store_manager' | 'warehouse_admin';
  sender_name?: string;
  sender_store?: string;
  is_read: boolean;
  created_at: string;
  message_id?: string;
  reply_to_email_id?: string;
  email_sent?: boolean;
  source?: 'platform' | 'email_reply' | 'email_direct';
}

export interface SendMessageData {
  order_id: string;
  order_type: 'orders' | 'mto_orders' | 'wheel_orders';
  message_text: string;
  sender_email: string;
  sender_role: 'store_manager' | 'warehouse_admin';
  sender_name?: string;
  sender_store?: string;
  source?: 'platform' | 'email_reply' | 'email_direct';
  reply_to_email_id?: string;
}

/**
 * Send a message for an order with email integration
 */
export const sendOrderMessage = async (messageData: SendMessageData): Promise<{ data: OrderMessage | null; error: Error | null }> => {
  try {
    console.log("🔍 MESSAGE SERVICE - Sending order message:", messageData);
    
    const { data, error } = await supabase
      .from('order_messages')
      .insert({
        order_id: messageData.order_id,
        order_type: messageData.order_type,
        message_text: messageData.message_text,
        sender_email: messageData.sender_email,
        sender_role: messageData.sender_role,
        sender_name: messageData.sender_name,
        sender_store: messageData.sender_store,
        source: messageData.source || 'platform',
        reply_to_email_id: messageData.reply_to_email_id,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ MESSAGE SERVICE - Error sending message:", error);
      return { data: null, error: new Error(`Failed to send message: ${error.message}`) };
    }

    console.log("✅ MESSAGE SERVICE - Message sent successfully:", data);

    // Send email notification to recipients
    if (data) {
      await sendEmailNotification(data as OrderMessage, messageData);
    }

    return { data: data as OrderMessage, error: null };
  } catch (error) {
    console.error("❌ MESSAGE SERVICE - Unexpected error:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error sending message") 
    };
  }
};

/**
 * Send email notification for a new message using proper routing logic
 */
export const sendEmailNotification = async (message: OrderMessage, originalData: SendMessageData): Promise<void> => {
  try {
    console.log("📧 Sending email notification for message:", message.id);
    
    // Get order details to extract store number for routing
    let orderDetails: any = null;
    let storeNumber: string = '';

    const { data: orderData } = await supabase
      .from(message.order_type)
      .select('*')
      .eq('id', message.order_id)
      .single();

    if (orderData) {
      orderDetails = orderData;
      // Extract store number from store name (e.g., "Fort Worth 22" -> "22")
      const storeMatch = orderData.store?.match(/(\d+)$/);
      storeNumber = storeMatch ? storeMatch[1] : '';
    }

    if (!orderDetails || !storeNumber) {
      console.error("❌ Could not determine store number for email routing");
      return;
    }

    // Determine recipients based on order type using contact system
    let recipients: string[] = [];
    
    if (message.order_type === 'orders') {
      // Transfer orders - send to warehouse managers and coordinators
      recipients = getTransferEmailRecipients(storeNumber);
    } else if (message.order_type === 'mto_orders') {
      // MTO orders - send to retread managers, warehouse managers, and coordinators
      recipients = getMTOEmailRecipients(storeNumber);
    } else {
      // Default fallback - use transfer logic
      recipients = getTransferEmailRecipients(storeNumber);
    }

    if (recipients.length === 0) {
      console.error("❌ No recipients found for email notification");
      return;
    }

    console.log("📧 Email recipients:", recipients);

    // Generate message threading ID for email
    const messageId = message.message_id || `msg-${Date.now()}-${message.id}`;
    
    // Create email content
    const emailSubject = `Order #${orderDetails.product_number || orderDetails.id} - New Message from ${orderDetails.store}`;
    
    const emailHtml = generateEmailTemplate({
      message,
      orderDetails,
      messageId,
      isReply: !!message.reply_to_email_id
    });

    // Send email notification via edge function
    const { error: emailError } = await supabase.functions.invoke('send-order-message-email', {
      body: {
        to: recipients,
        subject: emailSubject,
        html: emailHtml,
        messageId: messageId,
        inReplyTo: message.reply_to_email_id,
        orderType: message.order_type,
        orderId: message.order_id
      }
    });

    if (emailError) {
      console.error("❌ Error sending email via edge function:", emailError);
      return;
    }

    // Mark message as email sent
    await supabase
      .from('order_messages')
      .update({ email_sent: true })
      .eq('id', message.id);

    console.log("✅ Email notification sent successfully to:", recipients);

  } catch (error) {
    console.error("❌ Error sending email notification:", error);
  }
};

/**
 * Generate email template for order messages
 */
function generateEmailTemplate({ message, orderDetails, messageId, isReply }: {
  message: OrderMessage;
  orderDetails: any;
  messageId: string;
  isReply: boolean;
}): string {
  const senderName = message.sender_name || message.sender_email;
  const senderType = message.sender_role === 'warehouse_admin' ? 'Warehouse Team' : 'Store Manager';
  const orderNumber = orderDetails.product_number || orderDetails.id;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">
          ${isReply ? 'Reply to' : 'New Message'} - Order #${orderNumber}
        </h2>
        <p style="color: #666; margin: 5px 0 0 0;">
          From: ${senderName} (${senderType}) - ${orderDetails.store}
        </p>
      </div>
      
      <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; line-height: 1.6;">
          ${message.message_text.replace(/\n/g, '<br>')}
        </p>
      </div>
      
      <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1976d2; margin: 0 0 15px 0;">Order Details:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #333;">
          <li>Order ID: ${orderDetails.id}</li>
          <li>Store: ${orderDetails.store}</li>
          <li>Product: ${orderDetails.product_number || 'N/A'}</li>
          <li>Description: ${orderDetails.description || 'N/A'}</li>
          <li>Date: ${new Date(orderDetails.timestamp || orderDetails.created_at).toLocaleDateString()}</li>
        </ul>
      </div>
      
      <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 12px;">
        <p>This message was sent via the Conlan Tire Ordering Platform messaging system.</p>
        <p>Message ID: ${messageId}</p>
      </div>
    </div>
  `;
}

/**
 * Get all messages for a specific order
 */
export const getOrderMessages = async (orderId: string, orderType: 'orders' | 'mto_orders' | 'wheel_orders'): Promise<{ data: OrderMessage[]; error: Error | null }> => {
  try {
    console.log("🔍 MESSAGE SERVICE - Fetching messages for order:", orderId, orderType);
    
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .eq('order_type', orderType)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("❌ MESSAGE SERVICE - Error fetching messages:", error);
      return { data: [], error: new Error(`Failed to fetch messages: ${error.message}`) };
    }

    console.log("✅ MESSAGE SERVICE - Messages fetched successfully:", data?.length || 0);
    
    return { data: (data as OrderMessage[]) || [], error: null };
  } catch (error) {
    console.error("❌ MESSAGE SERVICE - Unexpected error:", error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error("Unknown error fetching messages") 
    };
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (messageIds: string[]): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('order_messages')
      .update({ is_read: true })
      .in('id', messageIds);

    if (error) {
      console.error("❌ MESSAGE SERVICE - Error marking messages as read:", error);
      return { error: new Error(`Failed to mark messages as read: ${error.message}`) };
    }

    return { error: null };
  } catch (error) {
    console.error("❌ MESSAGE SERVICE - Unexpected error:", error);
    return { error: error instanceof Error ? error : new Error("Unknown error marking messages as read") };
  }
};

/**
 * Get message count for an order
 */
export const getOrderMessageCount = async (orderId: string, orderType: 'orders' | 'mto_orders' | 'wheel_orders'): Promise<{ count: number; error: Error | null }> => {
  try {
    const { count, error } = await supabase
      .from('order_messages')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId)
      .eq('order_type', orderType);

    if (error) {
      console.error("❌ MESSAGE SERVICE - Error getting message count:", error);
      return { count: 0, error: new Error(`Failed to get message count: ${error.message}`) };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error("❌ MESSAGE SERVICE - Unexpected error:", error);
    return { 
      count: 0, 
      error: error instanceof Error ? error : new Error("Unknown error getting message count") 
    };
  }
};
