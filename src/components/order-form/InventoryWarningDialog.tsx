import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface InventoryWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  productNumber: string;
  availableQuantity: number;
  requestedQuantity: number;
  isOutOfStock: boolean;
}

export function InventoryWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  productNumber,
  availableQuantity,
  requestedQuantity,
  isOutOfStock
}: InventoryWarningDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {isOutOfStock ? "Out of Stock Warning" : "Insufficient Inventory Warning"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3 text-left">
            <p className="font-semibold text-foreground">
              Product: <span className="font-mono">{productNumber}</span>
            </p>
            
            {isOutOfStock ? (
              <p>
                This item is currently <strong className="text-destructive">out of stock</strong>.
              </p>
            ) : (
              <p>
                Only <strong>{availableQuantity} units</strong> are available, 
                but you requested <strong>{requestedQuantity} units</strong>.
              </p>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 space-y-2">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                ⚠️ Important Notice:
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                <li>This order will be flagged for manual review</li>
                <li>Fulfillment may be delayed until inventory is restocked</li>
                <li>Warehouse staff will contact you if adjustments are needed</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Do you want to proceed with this order anyway?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel Order</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
