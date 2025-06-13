
import { supabase } from "@/integrations/supabase/client";
import type { OrderMessage, SendMessageData } from "./types";
import { parseOrderType, parseSenderRole, parseSource } from "./typeGuards";
import { sendEmailNotification } from "./emailUtils";
import { validateOrderData } from "./orderValidation";

/**
 * Send a message for an order with email integration and enhanced error handling
 * Now relies on database triggers to auto-populate sender fields from authenticated user profile
 */
export const sendOrderMessage = async (messageData: SendMessageData): Promise<{ data: OrderMessage | null; error: Error | null }> => {
  try {
    console.log("🔍 MESSAGE SERVICE - Starting message send with simplified data:", {
      order_id: messageData.order_id,
      order_type: messageData.order_type,
      message_text: messageData.message_text,
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

    // IMPORTANT: Only send order_id, order_type, message_text
    // The database trigger will auto-populate sender fields from auth.uid() -> profiles
    const simplifiedData = {
      order_id: validation.normalizedOrderId,
      order_type: validation.normalizedOrderType,
      message_text: messageData.message_text,
      source: messageData.source || 'platform',
      reply_to_email_id: messageData.reply_to_email_id,
    };

    console.log("🔍 MESSAGE SERVICE - Sending simplified message data (triggers will populate sender fields):", {
      ...simplifiedData,
      timestamp: new Date().toISOString()
    });
    
    const { data, error } = await supabase
      .from('order_messages')
      .insert(simplifiedData)
      .select()
      .single();

    if (error) {
      console.error("❌ MESSAGE SERVICE - Database insert error:", {
        error,
        simplifiedData,
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
          error: new Error(`Access denied: You don't have permission to send messages for this order. Please check your store assignment and try again.`) 
        };
      }

      return { data: null, error: new Error(`Failed to send message: ${error.message}`) };
    }

    console.log("✅ MESSAGE SERVICE - Message sent successfully with auto-populated sender fields:", {
      messageId: data?.id,
      normalizedOrderId: validation.normalizedOrderId,
      normalizedOrderType: validation.normalizedOrderType,
      senderEmail: data?.sender_email,
      senderStore: data?.sender_store,
      senderRole: data?.sender_role,
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
      messageData: {
        order_id: messageData.order_id,
        order_type: messageData.order_type,
        message_text_length: messageData.message_text?.length || 0
      },
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error("Unknown error sending message") 
    };
  }
};
