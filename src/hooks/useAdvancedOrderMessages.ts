import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdvancedMessageService, OrderMessage, TypingStatus, MessageTemplate } from '@/services/advancedMessageService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

export const useAdvancedOrderMessages = (orderId: string, orderType: 'orders' | 'mto_orders' | 'wheel_orders') => {
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingStatus[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // Debounced typing status
  const debouncedIsTyping = useDebounce(isTyping, 1000);

  // Fetch messages for the order
  const fetchMessages = useCallback(async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const result = await AdvancedMessageService.getMessages(orderId, orderType);
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
  }, [orderId, orderType, toast]);

  // Fetch message templates
  const fetchTemplates = useCallback(async () => {
    try {
      const templatesData = await AdvancedMessageService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  }, []);

  // Send a new message with optional attachments
  const sendMessage = useCallback(async (
    messageText: string, 
    attachments?: File[], 
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<boolean> => {
    if (!user || !orderId || !messageText.trim()) return false;

    setSending(true);
    setUploading(!!attachments?.length);
    
    try {
      const messageData = {
        order_id: orderId,
        order_type: orderType,
        message_text: messageText.trim(),
        sender_email: user.email,
        sender_role: user.isAdmin ? 'warehouse_admin' as const : 'store_manager' as const,
        sender_name: user.name,
        sender_store: user.storeName,
        source: 'platform' as const,
        priority,
        attachments
      };

      const result = await AdvancedMessageService.sendMessage(messageData);
      
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
          description: `Your ${attachments?.length ? 'message with attachments' : 'message'} has been sent and an email notification was delivered.`,
        });
        
        // Stop typing indicator
        setIsTyping(false);
        await updateTypingStatus(false);
        
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
      setUploading(false);
    }
  }, [user, orderId, orderType, toast, fetchMessages]);

  // Use a template
  const useTemplate = useCallback(async (templateId: string): Promise<string | null> => {
    try {
      const template = await AdvancedMessageService.useTemplate(templateId);
      if (template) {
        toast({
          title: "Template Applied",
          description: `"${template.title}" template has been applied.`,
        });
        return template.content;
      }
    } catch (error) {
      console.error("Error using template:", error);
    }
    return null;
  }, [toast]);

  // Update typing status
  const updateTypingStatus = useCallback(async (typing: boolean) => {
    if (!user || !orderId) return;
    
    try {
      await AdvancedMessageService.updateTypingStatus(
        orderId,
        orderType,
        user.email,
        user.name,
        typing
      );
    } catch (error) {
      console.error("Error updating typing status:", error);
    }
  }, [user, orderId, orderType]);

  // Fetch typing status
  const fetchTypingStatus = useCallback(async () => {
    if (!orderId) return;
    
    try {
      const status = await AdvancedMessageService.getTypingStatus(orderId, orderType);
      // Filter out current user
      const otherUsersTyping = status.filter(s => s.user_email !== user?.email);
      setTypingUsers(otherUsersTyping);
    } catch (error) {
      console.error("Error fetching typing status:", error);
    }
  }, [orderId, orderType, user?.email]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!user?.email) return;
    
    try {
      await Promise.all(
        messageIds.map(id => AdvancedMessageService.markAsRead(id, user.email))
      );
      // Refresh messages to update read status
      await fetchMessages();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [user?.email, fetchMessages]);

  // Handle typing indicator updates
  useEffect(() => {
    if (debouncedIsTyping !== undefined) {
      updateTypingStatus(debouncedIsTyping);
    }
  }, [debouncedIsTyping, updateTypingStatus]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!orderId || !orderType) return;

    console.log('🔔 Setting up advanced real-time subscriptions for:', { orderId, orderType });

    // Message updates subscription
    const messagesChannel = supabase
      .channel(`advanced-order-messages-${orderId}`)
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
            if (newMessage.order_type === orderType) {
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
            if (updatedMessage.order_type === orderType) {
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
      .subscribe();

    // Typing status subscription
    const typingChannel = supabase
      .channel(`typing-status-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          // Refresh typing status when changes occur
          fetchTypingStatus();
        }
      )
      .subscribe();

    // Set up periodic typing status polling
    const typingInterval = setInterval(fetchTypingStatus, 5000);

    return () => {
      console.log('🔔 Cleaning up advanced real-time subscriptions');
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
      clearInterval(typingInterval);
    };
  }, [orderId, orderType, user?.email, toast, fetchTypingStatus]);

  // Fetch initial data
  useEffect(() => {
    if (orderId && orderType) {
      fetchMessages();
      fetchTemplates();
      fetchTypingStatus();
    }
  }, [orderId, orderType, fetchMessages, fetchTemplates, fetchTypingStatus]);

  return {
    messages,
    messageCount,
    loading,
    sending,
    uploading,
    typingUsers,
    templates,
    isTyping,
    setIsTyping,
    sendMessage,
    markAsRead,
    useTemplate,
    refreshMessages: fetchMessages,
    fetchMessageCount: () => Promise.resolve(messageCount),
  };
};