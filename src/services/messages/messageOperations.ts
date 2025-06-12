
import { supabase } from "@/integrations/supabase/client";
import type { OrderMessage, SendMessageData } from "./types";
import { parseOrderType, parseSenderRole, parseSource } from "./typeGuards";
import { sendEmailNotification } from "./emailUtils";

/**
 * Send a message for an order with email integration and enhanced error handling
 */
export const sendOrderMessage = async (messageData: SendMessageData): Promise<{ data: OrderMessage | null; error: Error | null }> => {
  try {
    console.log("🔍 MESSAGE SERVICE - Sending order message:", {
      ...messageData,
      timestamp: new Date().toISOString()
    });
    
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
      console.error("❌ MESSAGE SERVICE - Error sending message:", {
        error,
        messageData,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        timestamp: new Date().toISOString()
      });

      // Check for specific error types
      const isRLSError = error.message.includes('row-level security') || 
                        error.message.includes('policy') ||
                        error.code === 'PGRST116';
      
      const isPolicyError = error.message.includes('policy') && error.code === '42501';
      
      if (isRLSError || isPolicyError) {
        return { 
          data: null, 
          error: new Error(`Access denied: Row-Level Security policy violation. Check store permissions for order ${messageData.order_id}`) 
        };
      }

      return { data: null, error: new Error(`Failed to send message: ${error.message}`) };
    }

    console.log("✅ MESSAGE SERVICE - Message sent successfully:", {
      messageId: data?.id,
      timestamp: new Date().toISOString()
    });

    // Send email notification to recipient
    if (data) {
      try {
        await sendEmailNotification(data as any);
      } catch (emailError) {
        console.warn("⚠️ MESSAGE SERVICE - Email notification failed but message was saved:", emailError);
        // Don't fail the entire operation if email fails
      }
    }

    // Apply type guards to ensure safe casting
    const sanitizedMessage: OrderMessage = {
      ...data,
      order_type: parseOrderType(data.order_type),
      sender_role: parseSenderRole(data.sender_role),
      source: parseSource(data.source),
    };

    return { data: sanitizedMessage, error: null };
  } catch (error) {
    console.error("❌ MESSAGE SERVICE - Unexpected error:", {
      error,
      messageData,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error sending message") 
    };
  }
};

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
    
    // Apply type guards to safely map messages
    const sanitizedMessages: OrderMessage[] = (data ?? []).map(msg => ({
      ...msg,
      order_type: parseOrderType(msg.order_type),
      sender_role: parseSenderRole(msg.sender_role),
      source: parseSource(msg.source),
    }));

    return { data: sanitizedMessages, error: null };
  } catch (error) {
    console.error("❌ MESSAGE SERVICE - Unexpected error:", error);
    return { 
      data: [], 
      error: error instanceof Error ? error : new Error("Unknown error fetching messages") 
    };
  }
};

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
