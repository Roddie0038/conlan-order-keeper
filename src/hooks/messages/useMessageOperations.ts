
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderMessages, sendOrderMessage, markMessagesAsRead, getOrderMessageCount, type OrderMessage, type SendMessageData } from '@/services/messageService';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for handling message operations (fetch, send, mark as read)
 * Updated to work with secure RLS architecture using auth.uid() -> profiles
 */
export const useMessageOperations = (orderId: string, normalizedOrderType: 'orders' | 'mto_orders' | 'wheel_orders') => {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Log message sending failures for debugging
  const logMessageError = async (error: any, messageData: Partial<SendMessageData>) => {
    try {
      console.error("🚨 MESSAGE ERROR LOG:", {
        orderId: messageData.order_id,
        orderType: messageData.order_type,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        userContext: {
          userId: user?.id,
          email: user?.email
        }
      });
    } catch (logError) {
      console.error("Failed to log message error:", logError);
    }
  };

  // Fetch messages for the order
  const fetchMessages = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const result = await getOrderMessages(orderId, normalizedOrderType);
      if (result.error) {
        console.error("Error fetching messages:", result.error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        });
      } else {
        setMessages(result.data);
        setMessageCount(result.data.length);
      }
    } catch (error) {
      console.error("Unexpected error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get message count only
  const fetchMessageCount = async () => {
    if (!orderId) return;
    
    try {
      const result = await getOrderMessageCount(orderId, normalizedOrderType);
      if (!result.error) {
        setMessageCount(result.count);
      }
    } catch (error) {
      console.error("Error fetching message count:", error);
    }
  };

  // Send a new message with simplified payload - database triggers handle sender population
  const sendMessage = async (messageText: string) => {
    if (!user || !orderId || !messageText.trim()) {
      console.warn("🚨 MESSAGE SEND BLOCKED: Missing required data:", {
        hasUser: !!user,
        orderId,
        messageLength: messageText.length
      });
      return false;
    }

    setSending(true);
    
    // SIMPLIFIED: Only send the essential message data
    // Database triggers will auto-populate sender fields from auth.uid() -> profiles
    const messageData: SendMessageData = {
      order_id: orderId,
      order_type: normalizedOrderType,
      message_text: messageText.trim(),
      source: 'platform',
      // REMOVED: sender_email, sender_role, sender_name, sender_store
      // These are now auto-populated by database triggers from the authenticated user's profile
    } as SendMessageData;

    try {
      console.log("🔍 HOOK - Sending simplified message (triggers will populate sender fields):", {
        order_id: messageData.order_id,
        order_type: messageData.order_type,
        message_text_length: messageData.message_text.length,
        timestamp: new Date().toISOString()
      });

      const result = await sendOrderMessage(messageData);
      
      if (result.error) {
        console.error("❌ HOOK - Message send failed:", result.error);
        await logMessageError(result.error, messageData);
        
        // Provide more specific error messages based on error type
        const isAccessDenied = result.error.message.includes('Access denied') || 
                              result.error.message.includes('permission') ||
                              result.error.message.includes('policy');
        
        toast({
          title: "Message Failed",
          description: isAccessDenied 
            ? "Access denied. You can only send messages for orders from your assigned store."
            : "Failed to send message. Please try again or contact support.",
          variant: "destructive",
        });
        return false;
      } else {
        console.log("✅ HOOK - Message sent successfully with auto-populated sender fields:", {
          messageId: result.data?.id,
          senderEmail: result.data?.sender_email,
          senderStore: result.data?.sender_store,
          senderRole: result.data?.sender_role
        });
        toast({
          title: "Message Sent",
          description: "Your message has been sent and an email notification was delivered.",
        });
        
        // Refresh messages to show the new message
        await fetchMessages();
        return true;
      }
    } catch (error) {
      console.error("❌ HOOK - Message send exception:", error);
      await logMessageError(error, messageData);
      
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please check your connection and try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  // Mark messages as read
  const markAsRead = async (messageIds: string[]) => {
    try {
      await markMessagesAsRead(messageIds);
      // Refresh messages to update read status
      await fetchMessages();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  return {
    messages,
    messageCount,
    loading,
    sending,
    setMessages,
    setMessageCount,
    fetchMessages,
    fetchMessageCount,
    sendMessage,
    markAsRead,
  };
};
