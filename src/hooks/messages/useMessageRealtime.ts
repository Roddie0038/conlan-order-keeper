
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { OrderMessage } from '@/services/messageService';

/**
 * Hook for handling real-time message subscriptions
 */
export const useMessageRealtime = (
  orderId: string, 
  normalizedOrderType: 'orders' | 'mto_orders' | 'wheel_orders',
  setMessages: React.Dispatch<React.SetStateAction<OrderMessage[]>>,
  setMessageCount: React.Dispatch<React.SetStateAction<number>>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

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
  }, [orderId, normalizedOrderType, user?.email, toast, setMessages, setMessageCount]);
};
