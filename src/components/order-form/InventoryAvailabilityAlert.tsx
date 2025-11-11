import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, CheckCircle2, XCircle, Clock, TrendingDown } from "lucide-react";
import { checkInventoryAvailability } from "@/services/otPlatformClient";
import { format } from "date-fns";

interface InventoryAvailabilityAlertProps {
  productNumber: string;
  plant: string;
  requestedQuantity?: number;
}

export function InventoryAvailabilityAlert({
  productNumber,
  plant,
  requestedQuantity = 0
}: InventoryAvailabilityAlertProps) {
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<{
    available: boolean;
    quantity: number;
    status: string;
    lastUpdated: string;
  } | null>(null);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!productNumber || !plant) {
        setInventory(null);
        return;
      }

      setLoading(true);
      try {
        const result = await checkInventoryAvailability(productNumber, plant);
        setInventory(result);
      } catch (error) {
        console.error('Failed to check inventory:', error);
        setInventory(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the check to avoid too many requests
    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [productNumber, plant]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  if (!inventory) {
    return (
      <Alert className="border-muted">
        <Clock className="h-4 w-4" />
        <AlertTitle>No Inventory Data</AlertTitle>
        <AlertDescription>
          Unable to verify real-time inventory for this product. The order will be submitted for manual review.
        </AlertDescription>
      </Alert>
    );
  }

  // Out of stock
  if (inventory.status === 'out_of_stock' || inventory.quantity === 0) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Out of Stock
          <Badge variant="destructive">Unavailable</Badge>
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            <strong>{productNumber}</strong> is currently out of stock at <strong>{plant}</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {format(new Date(inventory.lastUpdated), 'MMM d, yyyy HH:mm:ss')}
          </p>
          <p className="text-xs font-medium">
            ⚠️ You can still proceed with this order. It will be flagged for manual review and may experience delays until restocked.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Insufficient quantity
  if (requestedQuantity > inventory.quantity) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          Insufficient Inventory
          <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-300">
            {inventory.quantity} Available
          </Badge>
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            Only <strong>{inventory.quantity} units</strong> available at <strong>{plant}</strong>, 
            but you requested <strong>{requestedQuantity} units</strong>.
          </p>
          <p className="text-xs text-muted-foreground">
            Last updated: {format(new Date(inventory.lastUpdated), 'MMM d, yyyy HH:mm:ss')}
          </p>
          <p className="text-xs font-medium">
            ⚠️ You can still proceed with this order. It will be flagged for manual review. Consider reducing quantity or splitting shipments.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Low stock warning (less than 20% of requested or less than 10 total)
  const isLowStock = inventory.quantity < 10 || (requestedQuantity > 0 && inventory.quantity < requestedQuantity * 1.5);
  
  if (isLowStock) {
    return (
      <Alert className="border-yellow-500/50 bg-yellow-500/10">
        <TrendingDown className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
          Low Stock Alert
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
            {inventory.quantity} Available
          </Badge>
        </AlertTitle>
        <AlertDescription className="space-y-2 text-yellow-800/90 dark:text-yellow-200/90">
          <p>
            Limited inventory at <strong>{plant}</strong>. Only <strong>{inventory.quantity} units</strong> available.
          </p>
          <p className="text-xs opacity-75">
            Last updated: {format(new Date(inventory.lastUpdated), 'MMM d, yyyy HH:mm:ss')}
          </p>
          {requestedQuantity > 0 && (
            <p className="text-xs">
              Your request for {requestedQuantity} units will leave {inventory.quantity - requestedQuantity} units in stock.
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Available with good stock
  return (
    <Alert className="border-green-500/50 bg-green-500/10">
      <CheckCircle2 className="h-4 w-4 text-green-600" />
      <AlertTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
        In Stock
        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-300">
          {inventory.quantity} Available
        </Badge>
      </AlertTitle>
      <AlertDescription className="text-green-800/90 dark:text-green-200/90">
        <p>
          <strong>{productNumber}</strong> is available at <strong>{plant}</strong>.
        </p>
        <p className="text-xs opacity-75 mt-1">
          Last updated: {format(new Date(inventory.lastUpdated), 'MMM d, yyyy HH:mm:ss')}
        </p>
      </AlertDescription>
    </Alert>
  );
}
