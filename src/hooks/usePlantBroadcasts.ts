import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlant } from '@/contexts/PlantContext';
import { 
  getPlantBroadcasts, 
  sendPlantBroadcast, 
  markPlantBroadcastAsRead,
  getUnreadPlantBroadcastCount,
  type PlantBroadcastWithRecipients,
  type SendPlantBroadcastData 
} from '@/services/plantBroadcastService';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePlantBroadcasts = () => {
  const [messages, setMessages] = useState<PlantBroadcastWithRecipients[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const { currentPlant } = usePlant();
  const { toast } = useToast();

  // Fetch plant broadcasts for current plant
  const fetchMessages = async () => {
    if (!currentPlant || !user) return;
    
    setLoading(true);
    try {
      const result = await getPlantBroadcasts(currentPlant);
      if (result.error) {
        console.error("Error fetching plant broadcasts:", result.error);
        toast({
          title: "Error",
          description: "Failed to load plant broadcasts. Please try again.",
          variant: "destructive",
        });
      } else {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Unexpected error fetching plant broadcasts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unread message count
  const fetchUnreadCount = async () => {
    if (!currentPlant || !user?.email) return;
    
    try {
      const result = await getUnreadPlantBroadcastCount(currentPlant, user.email);
      if (!result.error) {
        setUnreadCount(result.count);
      }
    } catch (error) {
      console.error("Error fetching unread plant broadcast count:", error);
    }
  };

  // Send a new plant broadcast
  const sendMessage = async (subject: string, body: string) => {
    if (!user || !currentPlant || !subject.trim() || !body.trim()) return false;

    setSending(true);
    try {
      const messageData: SendPlantBroadcastData = {
        plant_code: currentPlant,
        subject: subject.trim(),
        body: body.trim(),
        created_by: user.email
      };

      const result = await sendPlantBroadcast(messageData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: "Failed to send plant broadcast. Please try again.",
          variant: "destructive",
        });
        return false;
      } else {
        toast({
          title: "Broadcast Sent",
          description: "Your plant broadcast has been sent successfully.",
        });
        
        // Refresh messages to show the new message
        await fetchMessages();
        return true;
      }
    } catch (error) {
      console.error("Error sending plant broadcast:", error);
      toast({
        title: "Error",
        description: "Failed to send plant broadcast. Please try again.",
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
      await markPlantBroadcastAsRead(messageId, user.email);
      // Refresh messages and count to update read status
      await Promise.all([fetchMessages(), fetchUnreadCount()]);
    } catch (error) {
      console.error("Error marking plant broadcast as read:", error);
    }
  };

  // Set up real-time subscription for new plant broadcasts
  useEffect(() => {
    if (!currentPlant || !user) return;

    console.log('🔔 Setting up real-time subscription for plant broadcasts:', { plant: currentPlant });

    const channel = supabase
      .channel(`plant-broadcasts-${currentPlant}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'regional_messages',
          filter: `plant_code=eq.${currentPlant}`
        },
        (payload) => {
          console.log('🔔 Real-time plant broadcast update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as PlantBroadcastWithRecipients;
            setMessages(prev => [newMessage, ...prev]);
            
            // Show toast for new messages from others
            if (newMessage.created_by !== user?.email) {
              toast({
                title: "New Plant Broadcast",
                description: `New message: "${newMessage.subject}"`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedMessage = payload.new as PlantBroadcastWithRecipients;
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
          console.log('🔔 Real-time plant broadcast recipient update:', payload);
          
          // Refresh unread count when recipients change
          if (payload.eventType === 'UPDATE' && payload.new.user_email === user.email) {
            fetchUnreadCount();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to real-time plant broadcasts');
        } else if (status !== 'CLOSED') {
          console.error('❌ Failed to subscribe to real-time plant broadcasts:', status);
        }
      });

    return () => {
      console.log('🔔 Cleaning up real-time subscription for plant broadcasts');
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