
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CombinedOrder } from '../types';
import { getBadgeColor } from '../utils/badgeUtils';
import { MessageThread } from '@/components/messages/MessageThread';
import { MessageWarehouseDialog } from '@/components/messages/MessageWarehouseDialog';
import { MessageIndicator } from '@/components/messages/MessageIndicator';
import { useOrderMessages } from '@/hooks/useOrderMessages';

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: CombinedOrder | null;
}

export function OrderDetailModal({ open, onClose, order }: OrderDetailModalProps) {
  if (!order) return null;

  // Determine order type for messaging
  const getOrderType = (): 'orders' | 'mto_orders' | 'wheel_orders' => {
    if (order.orderType === 'MTO') return 'mto_orders';
    if (order.orderType === 'Wheel') return 'wheel_orders';
    return 'orders';
  };

  const orderType = getOrderType();
  const orderId = String(order.id);

  // Use the order messages hook
  const { 
    messages, 
    messageCount, 
    loading: messagesLoading, 
    sending, 
    sendMessage 
  } = useOrderMessages(orderId, orderType);

  const [showMessageDialog, setShowMessageDialog] = React.useState(false);

  const handleSendMessage = async (messageText: string): Promise<boolean> => {
    return await sendMessage(messageText);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-2">
              <DialogTitle className="text-xl font-semibold">
                Order Details – #{order.id}
              </DialogTitle>
              <Badge className={`${getBadgeColor(order.orderType)} text-white`}>
                {order.orderType}
              </Badge>
              <MessageIndicator messageCount={messageCount} />
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <div className="space-y-6">
            {/* Order Information Section */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Store Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Store:</span>
                      <span className="font-medium">{order.store}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact:</span>
                      <span>{order.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span>{new Date(order.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-600">Order Information</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Product:</span>
                      <span className="font-medium">{order.productNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Description:</span>
                      <span className="truncate max-w-xs">{order.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span>{order.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Messaging Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Messages with Warehouse</h3>
                <Button 
                  onClick={() => setShowMessageDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Send Message
                </Button>
              </div>
              
              <MessageThread messages={messages} loading={messagesLoading} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <MessageWarehouseDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        orderNumber={String(order.id)}
        storeName={order.store}
        onSendMessage={handleSendMessage}
        sending={sending}
      />
    </>
  );
}
