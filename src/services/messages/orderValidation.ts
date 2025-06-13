
import { supabase } from "@/integrations/supabase/client";
import type { SendMessageData } from "./types";
import { safeParseInt, normalizeOrderType } from "./validationUtils";

/**
 * Validate and normalize order data before sending message
 */
export const validateOrderData = async (messageData: SendMessageData): Promise<{ 
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
