
import { supabase } from "@/integrations/supabase/client";
import type { OrderMessage, SendMessageData } from "./types";
import { parseOrderType, parseSenderRole, parseSource } from "./typeGuards";
import { sendEmailNotification } from "./emailUtils";
import { validateOrderData } from "./orderValidation";

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
