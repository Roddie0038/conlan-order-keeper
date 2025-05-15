import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Truck, PackageCheck, Printer, Loader } from "lucide-react";
import { useOrderStatus, StatusUpdateParams } from "@/hooks/use-order-status";
import { OrderStatus } from "@/components/orders/StatusBadge";

interface OrderActionButtonsProps {
  orderId: string;
  status: OrderStatus;
  orderType: 'regular' | 'mto' | 'wheel';
  isAdmin: boolean;
  onStatusChange?: (newStatus: OrderStatus) => void;
  onPrint?: () => void;
}

export function OrderActionButtons({
  orderId,
  status,
  orderType,
  isAdmin,
  onStatusChange,
  onPrint
}: OrderActionButtonsProps) {
  const { updateOrderStatus, isUpdating } = useOrderStatus();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<StatusUpdateParams | null>(null);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (status === newStatus) return;

    const params = {
      orderId,
      currentStatus: status,
      newStatus,
      orderType
    };

    // For significant status changes, show confirmation dialog
    if (
      (status === "pending" && newStatus === "completed") ||
      (status === "ready_to_ship" && newStatus === "completed") ||
      (status === "in_transit" && newStatus === "completed")
    ) {
      setPendingAction(params);
      setConfirmDialogOpen(true);
      return;
    }

    // Otherwise proceed directly
    const result = await updateOrderStatus(params);
    if (result && onStatusChange) {
      onStatusChange(result);
    }
  };

  const confirmStatusUpdate = async () => {
    if (!pendingAction) return;
    
    const result = await updateOrderStatus(pendingAction);
    setConfirmDialogOpen(false);
    setPendingAction(null);
    
    if (result && onStatusChange) {
      onStatusChange(result);
    }
  };

  const cancelStatusUpdate = () => {
    setConfirmDialogOpen(false);
    setPendingAction(null);
  };

  if (!isAdmin) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onPrint}
        disabled={isUpdating}
      >
        <Printer className="mr-2 h-4 w-4" />
        Print Order
      </Button>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {status === "pending" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate("ready_to_ship")}
            disabled={isUpdating}
          >
            <Package className="mr-2 h-4 w-4" />
            Ready to Ship
          </Button>
        )}

        {(status === "pending" || status === "ready_to_ship") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate("in_transit")}
            disabled={isUpdating}
          >
            <Truck className="mr-2 h-4 w-4" />
            In Transit
          </Button>
        )}

        {(status === "in_transit") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStatusUpdate("received")}
            disabled={isUpdating}
          >
            <Loader className="mr-2 h-4 w-4" />
            Receive Order
          </Button>
        )}

        {(status !== "completed") && (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleStatusUpdate("completed")}
            disabled={isUpdating}
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            Complete Order
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          disabled={isUpdating}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Order
        </Button>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change this order's status to 
              {pendingAction?.newStatus === "completed" ? " completed" : pendingAction?.newStatus}? 
              This will {pendingAction?.newStatus === "completed" ? "mark the order as fulfilled and notify the store manager." : "update the order's status in the system."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelStatusUpdate}>Cancel</Button>
            <Button onClick={confirmStatusUpdate}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
