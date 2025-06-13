
import { supabase } from "@/integrations/supabase/client";
import type { OrderMessage } from "./types";
import { parseOrderType, parseSenderRole, parseSource } from "./typeGuards";
import { normalizeOrderType } from "./validationUtils";

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
