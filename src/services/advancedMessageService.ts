import { supabase } from "@/integrations/supabase/client";
import { getTransferEmailRecipients, getMTOEmailRecipients } from "@/config/contactSystem";

// Enhanced message types
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
  
  // Enhanced fields
  attachments?: any[];
  thread_id?: string;
  reply_to_message_id?: string;
  message_type?: 'text' | 'file' | 'system' | 'template';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  file_url: string;
  storage_path: string;
  uploaded_by: string;
  virus_scan_status: 'pending' | 'clean' | 'infected' | 'failed';
  download_count: number;
  created_at: string;
}

export interface MessageReadStatus {
  id: string;
  message_id: string;
  user_email: string;
  read_at: string;
}

export interface TypingStatus {
  order_id: string;
  order_type: string;
  user_email: string;
  user_name?: string;
  is_typing: boolean;
  last_updated: string;
  expires_at: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  is_system: boolean;
  created_by_email: string;
  usage_count: number;
  is_active: boolean;
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
  thread_id?: string;
  reply_to_message_id?: string;
  message_type?: 'text' | 'file' | 'system' | 'template';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: File[];
}

/**
 * Enhanced message service with file attachments and advanced features
 */
export class AdvancedMessageService {
  
  /**
   * Send a message with optional file attachments
   */
  static async sendMessage(messageData: SendMessageData): Promise<{ data: OrderMessage | null; error: Error | null }> {
    try {
      console.log("🔍 ADVANCED MESSAGE SERVICE - Sending message:", messageData);
      
      // Generate thread ID if not provided
      const threadId = messageData.thread_id || `thread-${messageData.order_id}-${Date.now()}`;
      
      // Insert the message first
      const { data: message, error: messageError } = await supabase
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
          thread_id: threadId,
          reply_to_message_id: messageData.reply_to_message_id,
          message_type: messageData.message_type || 'text',
          priority: messageData.priority || 'normal',
          attachments: []
        })
        .select()
        .single();

      if (messageError) {
        console.error("❌ ADVANCED MESSAGE SERVICE - Error sending message:", messageError);
        return { data: null, error: new Error(`Failed to send message: ${messageError.message}`) };
      }

      // Handle file attachments if provided
      if (messageData.attachments && messageData.attachments.length > 0) {
        const attachmentResults = await this.uploadAttachments(message.id, messageData.attachments);
        
        // Update message with attachment URLs
        await supabase
          .from('order_messages')
          .update({ 
            attachments: attachmentResults.map(a => ({ 
              id: a.id, 
              file_name: a.file_name, 
              file_url: a.file_url 
            }))
          })
          .eq('id', message.id);
      }

      console.log("✅ ADVANCED MESSAGE SERVICE - Message sent successfully:", message);

      // Send email notification
      await this.sendEmailNotification(message as OrderMessage, messageData);

      return { data: message as OrderMessage, error: null };
    } catch (error) {
      console.error("❌ ADVANCED MESSAGE SERVICE - Unexpected error:", error);
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error("Unknown error sending message") 
      };
    }
  }

  /**
   * Upload file attachments to storage
   */
  static async uploadAttachments(messageId: string, files: File[]): Promise<MessageAttachment[]> {
    const attachments: MessageAttachment[] = [];
    
    for (const file of files) {
      try {
        // Generate unique file path
        const fileExtension = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        const filePath = `${messageId}/${fileName}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error("❌ Failed to upload file:", uploadError);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(filePath);

        // Create attachment record
        const { data: attachmentRecord, error: attachmentError } = await supabase
          .from('message_attachments')
          .insert({
            message_id: messageId,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_url: publicUrl,
            storage_path: filePath,
            uploaded_by: (await supabase.auth.getUser()).data.user?.email || 'unknown',
            virus_scan_status: 'pending'
          })
          .select()
          .single();

        if (attachmentError) {
          console.error("❌ Failed to create attachment record:", attachmentError);
          continue;
        }

        attachments.push(attachmentRecord as MessageAttachment);
      } catch (error) {
        console.error("❌ Error processing attachment:", error);
      }
    }
    
    return attachments;
  }

  /**
   * Get messages with attachments and read status
   */
  static async getMessages(orderId: string, orderType: 'orders' | 'mto_orders' | 'wheel_orders'): Promise<{ data: OrderMessage[]; error: Error | null }> {
    try {
      console.log("🔍 ADVANCED MESSAGE SERVICE - Fetching messages for order:", orderId, orderType);
      
      const { data, error } = await supabase
        .from('order_messages')
        .select(`
          *,
          message_attachments(*)
        `)
        .eq('order_id', orderId)
        .eq('order_type', orderType)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("❌ ADVANCED MESSAGE SERVICE - Error fetching messages:", error);
        return { data: [], error: new Error(`Failed to fetch messages: ${error.message}`) };
      }

      console.log("✅ ADVANCED MESSAGE SERVICE - Messages fetched successfully:", data?.length || 0);
      
      return { data: (data as any[]) || [], error: null };
    } catch (error) {
      console.error("❌ ADVANCED MESSAGE SERVICE - Unexpected error:", error);
      return { 
        data: [], 
        error: error instanceof Error ? error : new Error("Unknown error fetching messages") 
      };
    }
  }

  /**
   * Mark message as read
   */
  static async markAsRead(messageId: string, userEmail: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('message_read_status')
        .upsert({
          message_id: messageId,
          user_email: userEmail,
          read_at: new Date().toISOString()
        }, {
          onConflict: 'message_id,user_email'
        });

      if (error) {
        console.error("❌ ADVANCED MESSAGE SERVICE - Error marking as read:", error);
        return { error: new Error(`Failed to mark as read: ${error.message}`) };
      }

      return { error: null };
    } catch (error) {
      console.error("❌ ADVANCED MESSAGE SERVICE - Unexpected error:", error);
      return { error: error instanceof Error ? error : new Error("Unknown error marking as read") };
    }
  }

  /**
   * Update typing status
   */
  static async updateTypingStatus(
    orderId: string, 
    orderType: string, 
    userEmail: string, 
    userName: string, 
    isTyping: boolean
  ): Promise<void> {
    try {
      await supabase
        .from('typing_status')
        .upsert({
          order_id: orderId,
          order_type: orderType,
          user_email: userEmail,
          user_name: userName,
          is_typing: isTyping,
          last_updated: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30000).toISOString() // 30 seconds
        }, {
          onConflict: 'order_id,order_type,user_email'
        });
    } catch (error) {
      console.error("❌ Error updating typing status:", error);
    }
  }

  /**
   * Get typing status for an order
   */
  static async getTypingStatus(orderId: string, orderType: string): Promise<TypingStatus[]> {
    try {
      const { data, error } = await supabase
        .from('typing_status')
        .select('*')
        .eq('order_id', orderId)
        .eq('order_type', orderType)
        .eq('is_typing', true)
        .gt('expires_at', new Date().toISOString());

      if (error) {
        console.error("❌ Error fetching typing status:", error);
        return [];
      }

      return data as TypingStatus[];
    } catch (error) {
      console.error("❌ Error fetching typing status:", error);
      return [];
    }
  }

  /**
   * Get message templates
   */
  static async getTemplates(category?: string): Promise<MessageTemplate[]> {
    try {
      let query = supabase
        .from('message_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("❌ Error fetching templates:", error);
        return [];
      }

      return data as MessageTemplate[];
    } catch (error) {
      console.error("❌ Error fetching templates:", error);
      return [];
    }
  }

  /**
   * Use a template and increment usage count
   */
  static async useTemplate(templateId: string): Promise<MessageTemplate | null> {
    try {
      // Increment usage count
      const { data: currentTemplate } = await supabase
        .from('message_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();
      
      await supabase
        .from('message_templates')
        .update({ usage_count: (currentTemplate?.usage_count || 0) + 1 })
        .eq('id', templateId);

      // Get the template
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error("❌ Error fetching template:", error);
        return null;
      }

      return data as MessageTemplate;
    } catch (error) {
      console.error("❌ Error using template:", error);
      return null;
    }
  }

  /**
   * Send email notification (enhanced version)
   */
  private static async sendEmailNotification(message: OrderMessage, originalData: SendMessageData): Promise<void> {
    try {
      console.log("📧 Sending enhanced email notification for message:", message.id);
      
      // Get order details
      const { data: orderData } = await supabase
        .from(message.order_type)
        .select('*')
        .eq('id', message.order_id)
        .single();

      if (!orderData) {
        console.error("❌ Could not find order for email notification");
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
        console.error("❌ No recipients found for email notification");
        return;
      }

      // Generate enhanced email content  
      const productNumber = (orderData as any).product_number || (orderData as any).productnumber || orderData.id;
      const emailSubject = `[${message.priority?.toUpperCase()}] Order #${productNumber} - Message from ${orderData.store}`;
      
      const emailHtml = this.generateEnhancedEmailTemplate({
        message,
        orderData,
        hasAttachments: message.attachments && message.attachments.length > 0
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
          orderId: message.order_id,
          priority: message.priority
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

      console.log("✅ Enhanced email notification sent successfully to:", recipients);

    } catch (error) {
      console.error("❌ Error sending enhanced email notification:", error);
    }
  }

  /**
   * Generate enhanced email template
   */
  private static generateEnhancedEmailTemplate({ message, orderData, hasAttachments }: {
    message: OrderMessage;
    orderData: any;
    hasAttachments: boolean;
  }): string {
    const senderName = message.sender_name || message.sender_email;
    const senderType = message.sender_role === 'warehouse_admin' ? 'Warehouse Team' : 'Store Manager';
    const orderNumber = (orderData as any).product_number || (orderData as any).productnumber || orderData.id;
    const priorityBadge = message.priority !== 'normal' ? 
      `<span style="background: ${message.priority === 'high' ? '#ef4444' : message.priority === 'urgent' ? '#dc2626' : '#f59e0b'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">${message.priority?.toUpperCase()}</span>` : '';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #333; margin: 0; display: flex; align-items: center; gap: 10px;">
            New Message - Order #${orderNumber}
            ${priorityBadge}
          </h2>
          <p style="color: #666; margin: 5px 0 0 0;">
            From: ${senderName} (${senderType}) - ${orderData.store}
          </p>
          ${hasAttachments ? '<p style="color: #0066cc; margin: 5px 0 0 0; font-weight: bold;">📎 Contains attachments</p>' : ''}
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; line-height: 1.6; white-space: pre-wrap;">
            ${message.message_text}
          </p>
        </div>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #1976d2; margin: 0 0 15px 0;">Order Details:</h3>
          <ul style="margin: 0; padding-left: 20px; color: #333;">
            <li>Order ID: ${orderData.id}</li>
            <li>Store: ${orderData.store}</li>
            <li>Product: ${orderData.product_number || 'N/A'}</li>
            <li>Description: ${orderData.description || 'N/A'}</li>
            <li>Date: ${new Date(orderData.timestamp || orderData.created_at).toLocaleDateString()}</li>
            <li>Thread: ${message.thread_id}</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #ddd; padding-top: 20px; color: #666; font-size: 12px;">
          <p>This message was sent via the Conlan Tire Advanced Messaging Platform.</p>
          <p>Message ID: ${message.message_id} | Type: ${message.message_type} | Priority: ${message.priority}</p>
        </div>
      </div>
    `;
  }
}

// Export legacy functions for backward compatibility
export const sendOrderMessage = AdvancedMessageService.sendMessage;
export const getOrderMessages = AdvancedMessageService.getMessages;
export const markMessagesAsRead = (messageIds: string[]) => {
  // For backward compatibility, mark multiple messages as read
  return Promise.all(
    messageIds.map(id => AdvancedMessageService.markAsRead(id, ''))
  ).then(() => ({ error: null }));
};
export const getOrderMessageCount = async (orderId: string, orderType: 'orders' | 'mto_orders' | 'wheel_orders') => {
  const result = await AdvancedMessageService.getMessages(orderId, orderType);
  return { count: result.data.length, error: result.error };
};