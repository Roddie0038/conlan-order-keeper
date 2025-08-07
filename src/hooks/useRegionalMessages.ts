import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlant } from '@/contexts/PlantContext';
import { 
  getRegionalMessages, 
  sendRegionalMessage, 
  markRegionalMessageAsRead,
  getUnreadRegionalMessageCount,
  type RegionalMessageWithRecipients,
  type SendRegionalMessageData 
} from '@/services/regionalMessageService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useRegionalMessages = () => {
  const [messages, setMessages] = useState<RegionalMessageWithRecipients[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { currentPlant } = usePlant();
  const { toast } = useToast();

  // Fetch regional messages for current plant
  const fetchMessages = async () => {
    if (!currentPlant || !user) return;
    
    setLoading(true);
    try {
      const result = await getRegionalMessages(currentPlant);
      if (result.error) {
        console.error("Error fetching regional messages:", result.error);
        toast({
          title: "Error",
          description: "Failed to load regional messages. Please try again.",
          variant: "destructive",
        });
      } else {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Unexpected error fetching regional messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unread message count
  const fetchUnreadCount = async () => {
    if (!currentPlant || !user?.email) return;
    
    try {
      const result = await getUnreadRegionalMessageCount(currentPlant, user.email);
      if (!result.error) {
        setUnreadCount(result.count);
      }
    } catch (error) {
      console.error("Error fetching unread regional message count:", error);
    }
  };

  // Send a new regional message
  const sendMessage = async (subject: string, body: string) => {
    if (!user || !currentPlant || !subject.trim() || !body.trim()) return false;

    setSending(true);
    try {
      const messageData: SendRegionalMessageData = {
        plant_code: currentPlant,
        subject: subject.trim(),
        body: body.trim(),
        created_by: user.email
      };

      const result = await sendRegionalMessage(messageData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to send regional message. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Message Sent",
          description: "Your regional message has been sent successfully.",
        });
        
        // Refresh messages to show the new message
        await fetchMessages();
        return true;
      }
    } catch (error) {
      console.error("Error sending regional message:", error);
      toast({
        title: "Error",
        description: "Failed to send regional message. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSending(false);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    if (!user?.email) return;

    try {
      await markRegionalMessageAsRead(messageId, user.email);
      // Refresh messages and count to update read status
      await Promise.all([fetchMessages(), fetchUnreadCount()]);
    } catch (error) {
      console.error("Error marking regional message as read:", error);
    }
  };

  // Set up real-time subscription for new regional messages
  useEffect(() => {
    if (!currentPlant || !user) return;

    console.log('🔔 Setting up real-time subscription for regional messages:', { plant: currentPlant });

    const channel = supabase
      .channel(`regional-messages-${currentPlant}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'regional_messages',
          filter: `plant_code=eq.${currentPlant}`
        },
        (payload) => {
          console.log('🔔 Real-time regional message update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as RegionalMessageWithRecipients;
            setMessages(prev => [newMessage, ...prev]);
            
            // Show toast for new messages from others
            if (newMessage.created_by !== user?.email) {
              toast({
                title: "New Regional Message",
                description: `New message: "${newMessage.subject}"`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as RegionalMessageWithRecipients;
            setMessages(prev => 
              prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
            );
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => 
              prev.filter(msg => msg.id !== payload.old.id)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'regional_message_recipients'
        },
        (payload) => {
          console.log('🔔 Real-time regional message recipient update:', payload);
          
          // Refresh unread count when recipients change
          if (payload.eventType === 'UPDATE' && payload.new.user_email === user.email) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to real-time regional messages');
        } else if (status !== 'CLOSED') {
          console.error('❌ Failed to subscribe to real-time regional messages:', status);
        }
      });

    return () => {
      console.log('🔔 Cleaning up real-time subscription for regional messages');
      supabase.removeChannel(channel);
    };
  }, [currentPlant, user?.email, toast]);

  // Fetch messages and unread count on mount and when plant/user changes
  useEffect(() => {
    if (currentPlant && user) {
      Promise.all([fetchMessages(), fetchUnreadCount()]);
    }
  }, [currentPlant, user?.email]);

  return {
    messages,
    unreadCount,
    loading,
    sending,
    sendMessage,
    markAsRead,
    refreshMessages: fetchMessages,
    fetchUnreadCount,
  };
};