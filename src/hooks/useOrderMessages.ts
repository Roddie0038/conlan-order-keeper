
import { useEffect } from 'react';
import { useOrderTypeNormalization } from './messages/useOrderTypeNormalization';
import { useMessageOperations } from './messages/useMessageOperations';
import { useMessageRealtime } from './messages/useMessageRealtime';

export const useOrderMessages = (orderId: string, orderType: 'orders' | 'mto_orders' | 'wheel_orders') => {
  const { normalizeOrderType } = useOrderTypeNormalization();
  
  // Normalize the order type
  const normalizedOrderType = normalizeOrderType(orderType);

  const {
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
  } = useMessageOperations(orderId, normalizedOrderType);

  // Set up real-time subscription
  useMessageRealtime(orderId, normalizedOrderType, setMessages, setMessageCount);

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
