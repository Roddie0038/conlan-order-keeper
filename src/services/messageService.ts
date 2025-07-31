import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

// Define types locally since they're missing from @/types/orders
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

export interface MessageFilters {
  read?: boolean;
  sender_role?: 'store_manager' | 'warehouse_admin';
  source?: 'platform' | 'email_reply' | 'email_direct';
}

// Temporary contact system replacement
function getTransferEmailRecipients(storeNumber: string): string[] {
  return [`store${storeNumber}@conlantire.com`];
}

function getMTOEmailRecipients(storeNumber: string): string[] {
  return [`mto${storeNumber}@conlantire.com`];
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
 * Send a message for an order
 */
export async function sendMessage(messageData: SendMessageData): Promise<{ data: OrderMessage | null; error: Error | null }> {
  try {
    logger.info("Sending message", { orderId: messageData.order_id, orderType: messageData.order_type });
    
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
        reply_to_email_id: messageData.reply_to_email_id
      })
      .select()
      .single();

    if (error) {
      logger.error("Error sending message", { error: error.message }, error);
      return { data: null, error: new Error(`Failed to send message: ${error.message}`) };
    }

    logger.info("Message sent successfully", { messageId: data.id });

    // Send email notification
    await sendEmailNotification(data as OrderMessage, messageData);

    return { data: data as OrderMessage, error: null };
  } catch (error) {
    logger.error("Unexpected error sending message", {}, error instanceof Error ? error : new Error(String(error)));
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error sending message") 
    };
  }
}

/**
 * Get messages for an order with filtering
 */
export async function getMessages(
  orderId: string, 
  orderType: 'orders' | 'mto_orders' | 'wheel_orders',
  filters?: MessageFilters
): Promise<{ data: OrderMessage[]; error: Error | null }> {
  try {
    logger.info("Fetching messages", { orderId, orderType });
    
    let query = supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .eq('order_type', orderType);

    if (filters?.read === true) {
      query = query.eq('is_read', true);
    } else if (filters?.read === false) {
      query = query.eq('is_read', false);
    }

    if (filters?.sender_role) {
      query = query.eq('sender_role', filters.sender_role);
    }

    if (filters?.source) {
      query = query.eq('source', filters.source);
    }

    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      logger.error("Error fetching messages", { error: error.message }, error);
      return { data: [], error: new Error(`Failed to fetch messages: ${error.message}`) };
    }

    logger.info("Messages fetched successfully", { count: data?.length || 0 });
    
    return { data: (data as OrderMessage[]) || [], error: null };
  } catch (error) {
    logger.error("Unexpected error fetching messages", {}, error instanceof Error ? error : new Error(String(error)));
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error("Unknown error fetching messages") 
    };
  }
}

/**
 * Mark a message as read
 */
// Legacy exports for compatibility
export const getOrderMessages = getMessages;
export const sendOrderMessage = sendMessage;
export const getOrderMessageCount = async (orderId: string, orderType: string) => ({ count: 0, error: null }); // Placeholder

export async function markMessageAsRead(messageId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('order_messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) {
      logger.error("Error marking message as read", { error: error.message }, error);
      return { error: new Error(`Failed to mark message as read: ${error.message}`) };
    }

    return { error: null };
  } catch (error) {
    logger.error("Unexpected error marking message as read", {}, error instanceof Error ? error : new Error(String(error)));
    return { error: error instanceof Error ? error : new Error("Unknown error marking message as read") };
  }
}

// Legacy alias
export const markMessagesAsRead = markMessageAsRead;

/**
 * Send email notification (internal helper)
 */
async function sendEmailNotification(message: OrderMessage, originalData: SendMessageData): Promise<void> {
  try {
    logger.info("Sending email notification for message", { messageId: message.id });
    
    // Get order details
    const { data: orderData } = await supabase
      .from(message.order_type)
      .select('*')
      .eq('id', message.order_id)
      .single();

    if (!orderData) {
      logger.error("Could not find order for email notification");
      return;
    }

    // Extract store number for routing
    const storeMatch = orderData.store?.match(/(\d+)$/);
    const storeNumber = storeMatch ? storeMatch[1] : '';

    // Determine recipients
    let recipients: string[] = [];
    
    if (message.order_type === 'orders') {
      recipients = getTransferEmailRecipients(storeNumber);
    } else if (message.order_type === 'mto_orders') {
      recipients = getMTOEmailRecipients(storeNumber);
    } else {
      recipients = getTransferEmailRecipients(storeNumber);
    }

    if (recipients.length === 0) {
      logger.error("No recipients found for email notification");
      return;
    }

    // Generate email content  
    const productNumber = (orderData as any).product_number || (orderData as any).productnumber || orderData.id;
    const emailSubject = `Order #${productNumber} - Message from ${orderData.store}`;
    
    const emailHtml = generateEmailTemplate({
      message,
      orderData
    });

    // Send email via edge function
    const { error: emailError } = await supabase.functions.invoke('send-order-message-email', {
      body: {
        to: recipients,
        subject: emailSubject,
        html: emailHtml,
        messageId: message.message_id,
        inReplyTo: message.reply_to_email_id,
        orderType: message.order_type,
        orderId: message.order_id
      }
    });

    if (emailError) {
      logger.error("Error sending email via edge function", { error: emailError.message }, emailError);
      return;
    }

    // Mark message as email sent
    await supabase
      .from('order_messages')
      .update({ email_sent: true })
      .eq('id', message.id);

    logger.info("Email notification sent successfully", { recipients });

  } catch (error) {
    logger.error("Error sending email notification", {}, error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * Generate email template
 */
function generateEmailTemplate({ message, orderData }: {
  message: OrderMessage;
  orderData: any;
}): string {
  const senderName = message.sender_name || message.sender_email;
  const senderType = message.sender_role === 'warehouse_admin' ? 'Warehouse Team' : 'Store Manager';
  const orderNumber = (orderData as any).product_number || (orderData as any).productnumber || orderData.id;
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0;">
          New Message - Order #${orderNumber}
        </h2>
        <p style="color: #666; margin: 5px 0 0 0;">
          From: ${senderName} (${senderType})
        </p>
      </div>
      
      <div style="background: white; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <p style="color: #333; line-height: 1.6; margin: 0;">
          ${message.message_text}
        </p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px;">
        <h4 style="color: #333; margin: 0 0 10px 0;">Order Details:</h4>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 0; color: #666; font-weight: bold;">Order ID:</td>
            <td style="padding: 5px 0; color: #333;">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666; font-weight: bold;">Store:</td>
            <td style="padding: 5px 0; color: #333;">${orderData.store}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #666; font-weight: bold;">Product:</td>
            <td style="padding: 5px 0; color: #333;">${orderData.description || 'N/A'}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>This is an automated notification from the Ordering Platform.</p>
      </div>
    </div>
  `;
}