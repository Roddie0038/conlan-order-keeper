
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  PackageCheck, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Hourglass 
} from "lucide-react";

export type OrderStatus = 
  | "pending" 
  | "ready_to_ship" 
  | "in_transit" 
  | "received" 
  | "completed"
  | "out_of_stock";

interface StatusBadgeProps {
  status: OrderStatus;
  outOfStock?: boolean;
}

export function StatusBadge({ status, outOfStock }: StatusBadgeProps) {
  // If the order is marked as out of stock, show that instead of the regular status
  if (outOfStock || status === "out_of_stock") {
    return (
      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 flex items-center gap-1.5">
        <Hourglass className="h-3 w-3" />
        Out of Stock
      </Badge>
    );
  }

  switch (status) {
    case "pending":
      return (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      );
    case "ready_to_ship":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-1.5">
          <PackageCheck className="h-3 w-3" />
          Ready to Ship
        </Badge>
      );
    case "in_transit":
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 flex items-center gap-1.5">
          <Truck className="h-3 w-3" />
          In Transit
        </Badge>
      );
    case "received":
      return (
        <Badge variant="outline" className="bg-cyan-100 text-cyan-800 border-cyan-300 flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3" />
          Received
        </Badge>
      );
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1.5">
          <CheckCircle className="h-3 w-3" />
          Completed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" />
          Unknown
        </Badge>
      );
  }
}
