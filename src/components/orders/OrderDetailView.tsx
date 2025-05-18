
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, File, CheckCircle, Send, AlertTriangle } from "lucide-react";
import { StatusBadge, OrderStatus } from "@/components/orders/StatusBadge";
import { OrderActionButtons } from "@/components/orders/OrderActionButtons";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface OrderDetailViewProps {
  order: any;
  onClose: () => void;
  isAdmin?: boolean;
  onStatusChange?: (orderId: number, newStatus: OrderStatus) => void; // Updated from string to number
}

export function OrderDetailView({ order, onClose, isAdmin = false, onStatusChange }: OrderDetailViewProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    order.status || "pending"
  );
  const [messageRecipient, setMessageRecipient] = useState("store-manager");
  const [message, setMessage] = useState("");
  const [showOutOfStockDialog, setShowOutOfStockDialog] = useState(false);
  const [outOfStock, setOutOfStock] = useState(Boolean(order.out_of_stock));
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast({
        title: "Message cannot be empty",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    const recipientType = messageRecipient === "store-manager" ? "Store Manager" : "Order Submitter";
    
    toast({
      title: "Message Sent",
      description: `Your message has been sent to the ${recipientType}.`,
    });
    
    setMessage("");
  };

  const generateDocument = (documentType: string) => {
    handlePrint();
    toast({
      title: `${documentType} Generated`,
      description: "The document has been prepared and is ready for download.",
    });
  };

  // Determine order type
  const getOrderType = (): 'regular' | 'mto' | 'wheel' | 'cross-dock' => {
    if (order.order_type === 'MTO' || order.tire_size) return 'mto';
    if (order.order_type === 'WHEEL_POWDER_COATING' || order.wheel_size) return 'wheel';
    if (order.cross_dock_type === 'Yes' || order.cross_dock_destination) return 'cross-dock';
    return 'regular';
  };

  const orderType = getOrderType();

  return (
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
                <p><span className="font-semibold">Date:</span> {new Date(order.timestamp).toLocaleString()}</p>
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
          {(order.cross_dock_type === "Yes" || orderType === 'cross-dock') && (
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
          {orderType === 'mto' && (
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
          {orderType === 'wheel' && (
            <div>
              <h3 className="font-medium text-gray-700">Wheel Details</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-semibold">Wheel Size:</span> {order.wheel_size || 'N/A'}</p>
                <p><span className="font-semibold">Wheel Type:</span> {order.wheel_type || 'N/A'}</p>
                <p><span className="font-semibold">Color:</span> {order.desired_color || 'N/A'}</p>
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

        {/* Send Special Message */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Send Special Message</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Recipient:</label>
              <Select value={messageRecipient} onValueChange={setMessageRecipient}>
                <SelectTrigger className="w-full md:w-[250px]">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="store-manager">Store Manager</SelectItem>
                  <SelectItem value="order-submitter">Order Submitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Message:</label>
              <Textarea 
                placeholder="Enter your message here..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full"
              />
            </div>
            
            <Button 
              onClick={handleSendMessage}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
