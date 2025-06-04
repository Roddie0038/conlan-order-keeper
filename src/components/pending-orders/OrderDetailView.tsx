
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { File, CheckCircle, XCircle, MessageSquare, RefreshCw, Hourglass } from "lucide-react";
import { MessageWarehouseDialog } from "@/components/messages/MessageWarehouseDialog";
import { MessageThread } from "@/components/messages/MessageThread";
import { MessageIndicator } from "@/components/messages/MessageIndicator";
import { useOrderMessages } from "@/hooks/useOrderMessages";

interface OrderDetailViewProps {
  order: any;
  onClose: () => void;
}

export function OrderDetailView({ order, onClose }: OrderDetailViewProps) {
  const [outOfStock, setOutOfStock] = useState(false);
  const [showOutOfStockDialog, setShowOutOfStockDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const { toast } = useToast();

  // Determine order type
  const getOrderType = (): 'orders' | 'mto_orders' | 'wheel_orders' => {
    if (order.order_type === 'MTO' || order.tire_size) return 'mto_orders';
    if (order.order_type === 'WHEEL_POWDER_COATING' || order.wheel_size) return 'wheel_orders';
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

  const handleOutOfStockConfirm = () => {
    setOutOfStock(true);
    setShowOutOfStockDialog(false);
    toast({
      title: "Order marked as Out of Stock",
      description: "A notification has been prepared for sending to the store.",
    });
  };

  const handleMarkReadyToFulfill = () => {
    setOutOfStock(false);
    toast({
      title: "Order marked as Ready to Fulfill",
      description: "This order has been moved back to the active queue.",
    });
  };

  const generateDocument = (documentType: string) => {
    toast({
      title: `${documentType} Generated`,
      description: "The document has been prepared and is ready for download.",
    });
  };

  const handleSendMessage = async (messageText: string): Promise<boolean> => {
    return await sendMessage(messageText);
  };

  return (
    <div className="space-y-6">
      <Card className="w-full max-w-5xl mx-auto">
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">
              Order #{order.id} - {order.store}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {outOfStock ? (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  <Hourglass className="h-3 w-3 mr-1" />
                  Out of Stock
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Synced to Supabase
                </Badge>
              )}
              <MessageIndicator messageCount={messageCount} />
              <Button variant="ghost" size="sm" onClick={onClose}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-slate-500">Store Information</h4>
                <p className="font-medium">{order.store}</p>
                <p className="text-sm text-slate-600">{order.storeManager}</p>
                <p className="text-sm text-slate-600">{order.email}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-500">Order Date</h4>
                <p>{new Date(order.timestamp).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-slate-500">Product Information</h4>
                <p className="font-medium">{order.productNumber}</p>
                <p className="text-sm">{order.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-500">Quantity</h4>
                <p>{order.quantity}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-500">Schedule Arrival</h4>
                <p>{order.scheduleArrival}</p>
              </div>
            </div>
          </div>
          
          {order.notes && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-500">Notes</h4>
              <p className="text-sm bg-slate-50 p-3 rounded-md border">{order.notes}</p>
            </div>
          )}
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-medium mb-4">Document Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={() => generateDocument("Pull Sheet")}
                className="flex items-center gap-2"
              >
                <File className="h-4 w-4" />
                Pull Sheet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => generateDocument("Completion Sheet")}
                className="flex items-center gap-2"
              >
                <File className="h-4 w-4" />
                Completion Sheet
              </Button>
              <Button 
                variant="outline" 
                onClick={() => generateDocument("Cross-Dock Sheet")}
                className="flex items-center gap-2"
              >
                <File className="h-4 w-4" />
                Cross-Dock Sheet
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowMessageDialog(true)}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
              >
                <MessageSquare className="h-4 w-4" />
                Message Warehouse
              </Button>
              
              {outOfStock ? (
                <Button 
                  variant="outline" 
                  className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                  onClick={handleMarkReadyToFulfill}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Ready to Fulfill
                </Button>
              ) : (
                <Dialog open={showOutOfStockDialog} onOpenChange={setShowOutOfStockDialog}>
                  <Button 
                    variant="outline" 
                    className="bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 hover:text-amber-700"
                    onClick={() => setShowOutOfStockDialog(true)}
                  >
                    <File className="h-4 w-4 mr-2" />
                    Out-of-Stock Sheet
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Out of Stock</DialogTitle>
                    </DialogHeader>
                    <p className="text-slate-600">
                      Are you sure you want to mark this order as Out of Stock? 
                      This will notify the store and flag the order for priority fulfillment once inventory is available.
                    </p>
                    <DialogFooter className="flex justify-end space-x-2 mt-4">
                      <Button variant="ghost" onClick={() => setShowOutOfStockDialog(false)}>Cancel</Button>
                      <Button variant="default" onClick={handleOutOfStockConfirm}>Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Thread */}
      <MessageThread messages={messages} loading={messagesLoading} />

      {/* Message Warehouse Dialog */}
      <MessageWarehouseDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        orderNumber={String(order.id)}
        storeName={order.store}
        onSendMessage={handleSendMessage}
        sending={sending}
      />
    </div>
  );
}
