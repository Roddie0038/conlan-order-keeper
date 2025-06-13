
import { supabase } from "@/integrations/supabase/client";
import type { OrderMessage, SendMessageData } from "./types";
import { parseOrderType, parseSenderRole, parseSource } from "./typeGuards";
import { sendEmailNotification } from "./emailUtils";

/**
 * Safely parse a string to integer, returning null if invalid
 */
const safeParseInt = (str: string): number | null => {
  return /^\d+$/.test(str) ? parseInt(str, 10) : null;
};

/**
 * Normalize order type to match database values
 */
const normalizeOrderType = (orderType: string): 'orders' | 'mto_orders' | 'wheel_orders' => {
  const normalized = orderType.toLowerCase().trim();
  
  if (normalized === 'transfer' || normalized === 'orders' || normalized === 'order') {
    return 'orders';
  }
  if (normalized === 'mto' || normalized === 'mto_orders') {
    return 'mto_orders';
  }
  if (normalized === 'wheel' || normalized === 'wheel_orders') {
    return 'wheel_orders';
  }
  
  // Default fallback
  console.warn(`[MESSAGE] Unknown order type: ${orderType}, defaulting to 'orders'`);
  return 'orders';
};

/**
 * Validate and normalize order data before sending message
 */
const validateOrderData = async (messageData: SendMessageData): Promise<{ 
  isValid: boolean; 
  normalizedOrderId: string; 
  normalizedOrderType: 'orders' | 'mto_orders' | 'wheel_orders';
  error?: string;
}> => {
  const normalizedOrderType = normalizeOrderType(messageData.order_type);
  let normalizedOrderId = messageData.order_id;
  
  console.log("🔍 MESSAGE VALIDATION - Input data:", {
    originalOrderId: messageData.order_id,
    originalOrderType: messageData.order_type,
    normalizedOrderType,
    senderStore: messageData.sender_store
  });

  // If order_id looks like a display name (e.g., "transfer-92"), try to find the actual database ID
  if (normalizedOrderId.includes('-') && !normalizedOrderId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-/)) {
    console.log("🔍 MESSAGE VALIDATION - Detecting display name format, looking up actual ID");
    
    try {
      let query;
      const idPart = normalizedOrderId.split('-')[1]; // Extract "92" from "transfer-92"
      
      if (normalizedOrderType === 'orders') {
        // For orders table, we need to convert string to number since the ID is bigint
        const numericId = safeParseInt(idPart);
        if (numericId === null) {
          console.error("❌ MESSAGE VALIDATION - Invalid numeric ID for orders table:", idPart);
          return {
            isValid: false,
            normalizedOrderId,
            normalizedOrderType,
            error: `Invalid order ID format: ${normalizedOrderId}. Expected numeric ID for transfer orders.`
          };
        }
        
        query = supabase
          .from('orders')
          .select('id, store')
          .eq('id', numericId)
          .single();
      } else if (normalizedOrderType === 'mto_orders') {
        query = supabase
          .from('mto_orders')
          .select('id, store')
          .eq('id', idPart)
          .single();
      } else if (normalizedOrderType === 'wheel_orders') {
        query = supabase
          .from('wheel_orders')
          .select('id, store')
          .eq('id', idPart)
          .single();
      }

      if (query) {
        const { data, error } = await query;
        
        if (error) {
          console.error("❌ MESSAGE VALIDATION - Order lookup failed:", {
            error,
            orderType: normalizedOrderType,
            searchId: normalizedOrderType === 'orders' ? safeParseInt(idPart) : idPart,
            originalDisplayId: normalizedOrderId
          });
          return {
            isValid: false,
            normalizedOrderId,
            normalizedOrderType,
            error: `Order not found: ${normalizedOrderId}`
          };
        }

        if (data) {
          normalizedOrderId = data.id.toString();
          console.log("✅ MESSAGE VALIDATION - Found actual order ID:", {
            displayId: messageData.order_id,
            actualId: normalizedOrderId,
            orderStore: data.store,
            senderStore: messageData.sender_store
          });

          // Validate store match for store managers
          if (messageData.sender_role === 'store_manager' && data.store !== messageData.sender_store) {
            return {
              isValid: false,
              normalizedOrderId,
              normalizedOrderType,
              error: `Store mismatch: Order belongs to '${data.store}' but sender is from '${messageData.sender_store}'`
            };
          }
        }
      }
    } catch (error) {
      console.error("❌ MESSAGE VALIDATION - Unexpected error during ID lookup:", error);
      return {
        isValid: false,
        normalizedOrderId,
        normalizedOrderType,
        error: `Failed to validate order: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  return {
    isValid: true,
    normalizedOrderId,
    normalizedOrderType
  };
};

/**
 * Send a message for an order with email integration and enhanced error handling
 */
export const sendOrderMessage = async (messageData: SendMessageData): Promise<{ data: OrderMessage | null; error: Error | null }> => {
  try {
    console.log("🔍 MESSAGE SERVICE - Starting message send with raw data:", {
      ...messageData,
      timestamp: new Date().toISOString()
    });

    // Validate and normalize the order data
    const validation = await validateOrderData(messageData);
    if (!validation.isValid) {
      console.error("❌ MESSAGE SERVICE - Validation failed:", validation.error);
      return { 
        data: null, 
        error: new Error(`Validation failed: ${validation.error}`) 
      };
    }

    const normalizedData = {
      ...messageData,
      order_id: validation.normalizedOrderId,
      order_type: validation.normalizedOrderType
    };

    console.log("🔍 MESSAGE SERVICE - Sending normalized message data:", {
      ...normalizedData,
      timestamp: new Date().toISOString()
    });
    
    const { data, error } = await supabase
      .from('order_messages')
      .insert({
        order_id: normalizedData.order_id,
        order_type: normalizedData.order_type,
        message_text: normalizedData.message_text,
        sender_email: normalizedData.sender_email,
        sender_role: normalizedData.sender_role,
        sender_name: normalizedData.sender_name,
        sender_store: normalizedData.sender_store,
        source: normalizedData.source || 'platform',
        reply_to_email_id: normalizedData.reply_to_email_id,
      })
      .select()
      .single();

    if (error) {
      console.error("❌ MESSAGE SERVICE - Database insert error:", {
        error,
        normalizedData,
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
          error: new Error(`Access denied: Please check store permissions for order ${normalizedData.order_id}. Your store: ${normalizedData.sender_store}`) 
        };
      }

      return { data: null, error: new Error(`Failed to send message: ${error.message}`) };
    }

    console.log("✅ MESSAGE SERVICE - Message sent successfully:", {
      messageId: data?.id,
      normalizedOrderId: validation.normalizedOrderId,
      normalizedOrderType: validation.normalizedOrderType,
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
    const normalizedOrderType = normalizeOrderType(orderType);
    console.log("🔍 MESSAGE SERVICE - Fetching messages for order:", orderId, normalizedOrderType);
    
    const { data, error } = await supabase
      .from('order_messages')
      .select('*')
      .eq('order_id', orderId)
      .eq('order_type', normalizedOrderType)
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
    const normalizedOrderType = normalizeOrderType(orderType);
    
    const { count, error } = await supabase
      .from('order_messages')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId)
      .eq('order_type', normalizedOrderType);

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
