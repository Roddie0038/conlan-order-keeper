
import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { StatusBadge, OrderStatus } from "@/components/orders/StatusBadge";
import { OrderActionButtons } from "@/components/orders/OrderActionButtons";
import { useReactToPrint } from "react-to-print";

interface OrderDetailViewProps {
  order: any;
  onClose: () => void;
  isAdmin?: boolean;
}

export function OrderDetailView({ order, onClose, isAdmin = false }: OrderDetailViewProps) {
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(
    order.status || "pending"
  );
  const printRef = useRef<HTMLDivElement>(null);

  const handleStatusChange = (newStatus: OrderStatus) => {
    setCurrentStatus(newStatus);
  };

  const handlePrint = useReactToPrint({
    documentTitle: `Order-${order.id}`,
    // The correct way to pass the content with the react-to-print library
    contentRef: printRef
  });

  // Determine order type
  const getOrderType = (): 'regular' | 'mto' | 'wheel' => {
    if (order.type === 'MTO' || order.tireSize) return 'mto';
    if (order.type === 'WHEEL_POWDER_COATING' || order.wheelSize) return 'wheel';
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
                <p><span className="font-semibold">Product Number:</span> {order.productNumber}</p>
                <p><span className="font-semibold">Description:</span> {order.description}</p>
                <p><span className="font-semibold">Quantity:</span> {order.quantity}</p>
                {order.scheduleArrival && (
                  <p><span className="font-semibold">Schedule Arrival:</span> {order.scheduleArrival}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cross-Dock Information (if applicable) */}
          {order.crossDock === "Yes" && (
            <div>
              <h3 className="font-medium text-gray-700">Cross-Dock Information</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-semibold">Destination:</span> {order.crossDockDestination || 'N/A'}</p>
                <p><span className="font-semibold">Receiver Number:</span> {order.receiverNo || 'N/A'}</p>
                <p><span className="font-semibold">ETA Date:</span> {order.etaDate || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* MTO-specific Information (if applicable) */}
          {orderType === 'mto' && (
            <div>
              <h3 className="font-medium text-gray-700">MTO Details</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-semibold">Tire Size:</span> {order.tireSize || 'N/A'}</p>
                <p><span className="font-semibold">Tread:</span> {order.tread || order.tireTreadNeeded || 'N/A'}</p>
                <p><span className="font-semibold">Casing Grade:</span> {order.casingGrade || 'N/A'}</p>
              </div>
            </div>
          )}

          {/* Wheel-specific Information (if applicable) */}
          {orderType === 'wheel' && (
            <div>
              <h3 className="font-medium text-gray-700">Wheel Details</h3>
              <div className="mt-2 space-y-1 text-sm">
                <p><span className="font-semibold">Wheel Size:</span> {order.wheelSize || 'N/A'}</p>
                <p><span className="font-semibold">Wheel Type:</span> {order.wheelType || 'N/A'}</p>
                <p><span className="font-semibold">Color:</span> {order.desiredColor || 'N/A'}</p>
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

        <div className="mt-6 flex justify-end">
          <OrderActionButtons
            orderId={order.id}
            status={currentStatus}
            orderType={orderType}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange}
            onPrint={handlePrint}
          />
        </div>
      </CardContent>
    </Card>
  );
}
