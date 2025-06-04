
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getOrderMessages, sendOrderMessage, markMessagesAsRead, getOrderMessageCount, type OrderMessage, type SendMessageData } from '@/services/messageService';
import { useToast } from '@/components/ui/use-toast';

export const useOrderMessages = (orderId: string, orderType: 'orders' | 'mto_orders' | 'wheel_orders') => {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch messages for the order
  const fetchMessages = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const result = await getOrderMessages(orderId, orderType);
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
      const result = await getOrderMessageCount(orderId, orderType);
      if (!result.error) {
        setMessageCount(result.count);
      }
    } catch (error) {
      console.error("Error fetching message count:", error);
    }
  };

  // Send a new message
  const sendMessage = async (messageText: string) => {
    if (!user || !orderId || !messageText.trim()) return false;

    setSending(true);
    try {
      const messageData: SendMessageData = {
        order_id: orderId,
        order_type: orderType,
        message_text: messageText.trim(),
        sender_email: user.email,
        sender_role: user.isAdmin ? 'warehouse_admin' : 'store_manager',
        sender_name: user.name,
        sender_store: user.storeName,
      };

      const result = await sendOrderMessage(messageData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Message Sent",
          description: "Your message has been sent to the warehouse.",
        });
        
        // Refresh messages to show the new message
        await fetchMessages();
        return true;
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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

  // Fetch messages on mount and when orderId/orderType changes
  useEffect(() => {
    if (orderId && orderType) {
      fetchMessages();
    }
  }, [orderId, orderType]);

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
