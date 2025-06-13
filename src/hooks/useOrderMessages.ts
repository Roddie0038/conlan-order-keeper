
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderMessages, sendOrderMessage, markMessagesAsRead, getOrderMessageCount, type OrderMessage, type SendMessageData } from '@/services/messageService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

/**
 * Normalize order type for consistency across the application
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
  
  console.warn(`[HOOK] Unknown order type: ${orderType}, defaulting to 'orders'`);
  return 'orders';
};

export const useOrderMessages = (orderId: string, orderType: 'orders' | 'mto_orders' | 'wheel_orders') => {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Normalize the order type
  const normalizedOrderType = normalizeOrderType(orderType);

  // Log message sending failures for debugging
  const logMessageError = async (error: any, messageData: SendMessageData) => {
    try {
      console.error("🚨 MESSAGE ERROR LOG:", {
        orderId: messageData.order_id,
        orderType: messageData.order_type,
        senderRole: messageData.sender_role,
        senderEmail: messageData.sender_email,
        senderStore: messageData.sender_store,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        userContext: {
          isAdmin: user?.isAdmin,
          storeName: user?.storeName,
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

  // Send a new message with enhanced error handling and validation
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
    
    const messageData: SendMessageData = {
      order_id: orderId,
      order_type: normalizedOrderType,
      message_text: messageText.trim(),
      sender_email: user.email,
      sender_role: user.isAdmin ? 'warehouse_admin' : 'store_manager',
      sender_name: user.name,
      sender_store: user.storeName,
      source: 'platform'
    };

    try {
      console.log("🔍 HOOK - Sending message with normalized data:", {
        ...messageData,
        timestamp: new Date().toISOString()
      });

      const result = await sendOrderMessage(messageData);
      
      if (result.error) {
        console.error("❌ HOOK - Message send failed:", result.error);
        await logMessageError(result.error, messageData);
        
        // Provide more specific error messages based on error type
        const isRLSError = result.error.message.includes('row-level security') || 
                          result.error.message.includes('policy') ||
                          result.error.message.includes('permission') ||
                          result.error.message.includes('Access denied');
        
        toast({
          title: "Message Failed",
          description: isRLSError 
            ? "Access denied. Please check your store permissions and try again."
            : "Failed to send message. Please try again or contact support.",
          variant: "destructive",
        });
        return false;
      } else {
        console.log("✅ HOOK - Message sent successfully:", result.data?.id);
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

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!orderId || !normalizedOrderType) return;

    console.log('🔔 Setting up real-time subscription for messages:', { orderId, orderType: normalizedOrderType });

    const channel = supabase
      .channel(`order-messages-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          console.log('🔔 Real-time message update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as OrderMessage;
            if (newMessage.order_type === normalizedOrderType) {
              setMessages(prev => [...prev, newMessage]);
              setMessageCount(prev => prev + 1);
              
              // Show toast for new messages from others
              if (newMessage.sender_email !== user?.email) {
                toast({
                  title: "New Message",
                  description: `${newMessage.sender_name || 'Someone'} sent a message`,
                });
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as OrderMessage;
            if (updatedMessage.order_type === normalizedOrderType) {
              setMessages(prev => 
                prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
              );
            }
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => 
              prev.filter(msg => msg.id !== payload.old.id)
            );
            setMessageCount(prev => prev - 1);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to real-time messages');
        } else if (status !== 'CLOSED') {
          console.error('❌ Failed to subscribe to real-time messages:', status);
        }
      });

    return () => {
      console.log('🔔 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [orderId, normalizedOrderType, user?.email, toast]);

  // Fetch messages on mount and when orderId/orderType changes
  useEffect(() => {
    if (orderId && normalizedOrderType) {
      fetchMessages();
    }
  }, [orderId, normalizedOrderType]);

  return {
    messages,
    messageCount,
    loading,
    sending,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages,
    fetchMessageCount,
  };
};
