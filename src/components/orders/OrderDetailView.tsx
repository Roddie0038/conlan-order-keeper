import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, File, CheckCircle, MessageSquare, AlertTriangle } from "lucide-react";
import { StatusBadge, OrderStatus } from "@/components/orders/StatusBadge";
import { OrderActionButtons } from "@/components/orders/OrderActionButtons";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { MessageWarehouseDialog } from "@/components/messages/MessageWarehouseDialog";
import { MessageThread } from "@/components/messages/MessageThread";
import { MessageIndicator } from "@/components/messages/MessageIndicator";
import { useOrderMessages } from "@/hooks/useOrderMessages";

interface OrderDetailViewProps {
  order: any;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusChange?: (orderId: number, newStatus: OrderStatus) => void;
}

export function OrderDetailView({ order, onClose, isAdmin = false, onStatusChange }: OrderDetailViewProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    order.status || "pending"
  );
  const [showOutOfStockDialog, setShowOutOfStockDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [outOfStock, setOutOfStock] = useState(Boolean(order.out_of_stock));
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Determine order type and ID
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

  const handlePrint = useReactToPrint({
    documentTitle: `Order-${order.id}`,
    contentRef: printRef
  });

  const handleOutOfStockConfirm = () => {
    setOutOfStock(true);
    setShowOutOfStockDialog(false);
    if (onStatusChange) {
      onStatusChange(order.id, "out_of_stock");
    }
    toast({
      title: "Order marked as Out of Stock",
      description: "A notification has been prepared for sending to the store.",
    });
  };

  const handleMarkReadyToFulfill = () => {
    setOutOfStock(false);
    if (onStatusChange) {
      onStatusChange(order.id, "ready_to_ship");
    }
    toast({
      title: "Order marked as Ready to Fulfill",
      description: "This order has been moved back to the active queue.",
    });
  };

  const generateDocument = (documentType: string) => {
    handlePrint();
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
      <Card className="shadow-lg">
        <CardHeader className="bg-slate-50 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-xl">Order Details</CardTitle>
              <StatusBadge status={currentStatus} />
              {outOfStock && (
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                  Out of Stock
                </Badge>
              )}
              <MessageIndicator messageCount={messageCount} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Order ID: {order.id}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <div ref={printRef} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700">Store Information</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-semibold">Store:</span> {order.store}</p>
                  <p><span className="font-semibold">Contact:</span> {order.name || 'N/A'}</p>
                  <p><span className="font-semibold">Email:</span> {order.email || 'N/A'}</p>
                  <p><span className="font-semibold">Submitted:</span> {new Date(order.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700">Order Information</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-semibold">Type:</span> {orderType.charAt(0).toUpperCase() + orderType.slice(1)}</p>
                  <p><span className="font-semibold">Product Number:</span> {order.product_number}</p>
                  <p><span className="font-semibold">Description:</span> {order.description}</p>
                  <p><span className="font-semibold">Quantity:</span> {order.quantity}</p>
                  {order.schedule_arrival && (
                    <p><span className="font-semibold">Schedule Arrival:</span> {order.schedule_arrival}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Cross-Dock Information (if applicable) */}
            {order.cross_dock_type === "Yes" && (
              <div>
                <h3 className="font-medium text-gray-700">Cross-Dock Information</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-semibold">Destination:</span> {order.cross_dock_destination || 'N/A'}</p>
                  <p><span className="font-semibold">Receiver Number:</span> {order.cross_dock_receiver_number || 'N/A'}</p>
                  <p><span className="font-semibold">ETA Date:</span> {order.cross_dock_eta_date || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* MTO-specific Information (if applicable) */}
            {orderType === 'mto_orders' && (
              <div>
                <h3 className="font-medium text-gray-700">MTO Details</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-semibold">Tire Size:</span> {order.tire_size || 'N/A'}</p>
                  <p><span className="font-semibold">Tread:</span> {order.tread || 'N/A'}</p>
                  <p><span className="font-semibold">Casing Grade:</span> {order.casing_grade || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Wheel-specific Information (if applicable) */}
            {orderType === 'wheel_orders' && (
              <div>
                <h3 className="font-medium text-gray-700">Wheel Details</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="font-semibold">Wheel Size:</span> {order.wheelsize || order.wheel_size || 'N/A'}</p>
                  <p><span className="font-semibold">Wheel Type:</span> {order.wheeltype || order.wheel_type || 'N/A'}</p>
                  <p><span className="font-semibold">Material:</span> {order.wheelmaterial || order.wheel_material || 'N/A'}</p>
                  <p><span className="font-semibold">Color:</span> {order.desiredcolor || order.desired_color || 'N/A'}</p>
                  <p><span className="font-semibold">Store Color:</span> {order.store_color || 'N/A'}</p>
                  <p><span className="font-semibold">Hand Holes:</span> {order.handholes || order.hand_holes || 'N/A'}</p>
                </div>
              </div>
            )}

            {/* Notes Section */}
            <div>
              <h3 className="font-medium text-gray-700">Additional Notes</h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                {order.notes || 'No additional notes.'}
              </div>
            </div>

            {/* Status History */}
            {isAdmin && (
              <div>
                <h3 className="font-medium text-gray-700">Status Timeline</h3>
                <div className="mt-2 space-y-2 text-sm">
                  {order.status_updated_at && (
                    <div className="flex justify-between">
                      <span>Status last updated:</span>
                      <span>{new Date(order.status_updated_at).toLocaleString()}</span>
                    </div>
                  )}
                  {order.ready_to_ship_at && (
                    <div className="flex justify-between">
                      <span>Ready to ship:</span>
                      <span>{new Date(order.ready_to_ship_at).toLocaleString()}</span>
                    </div>
                  )}
                  {order.in_transit_at && (
                    <div className="flex justify-between">
                      <span>In transit:</span>
                      <span>{new Date(order.in_transit_at).toLocaleString()}</span>
                    </div>
                  )}
                  {order.received_at && (
                    <div className="flex justify-between">
                      <span>Received:</span>
                      <span>{new Date(order.received_at).toLocaleString()}</span>
                    </div>
                  )}
                  {order.completed_at && (
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span>{new Date(order.completed_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Actions</h3>
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
                <CheckCircle className="h-4 w-4" />
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
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Out-of-Stock
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Out of Stock</DialogTitle>
                    </DialogHeader>
                    <p className="text-slate-600">
                      This will mark the item as out of stock and notify the store manager. A PDF
                      will be generated and attached to the email.
                    </p>
                    <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded flex items-center gap-2 border border-amber-200 mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      This action will flag the order in the dashboard as "Out of Stock".
                    </p>
                    <DialogFooter className="flex justify-end space-x-2 mt-4">
                      <Button variant="ghost" onClick={() => setShowOutOfStockDialog(false)}>Cancel</Button>
                      <Button variant="default" onClick={handleOutOfStockConfirm}>Confirm Out of Stock</Button>
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
