
import { Badge } from "@/components/ui/badge";
import { Loader, Truck, Package, Clock, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus = "pending" | "ready_to_ship" | "in_transit" | "received" | "completed";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return {
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: "Pending",
          colors: "bg-amber-100 text-amber-800 border-amber-300"
        };
      case "ready_to_ship":
        return {
          icon: <Package className="h-3 w-3 mr-1" />,
          label: "Ready to Ship",
          colors: "bg-blue-100 text-blue-800 border-blue-300"
        };
      case "in_transit":
        return {
          icon: <Truck className="h-3 w-3 mr-1" />,
          label: "In Transit",
          colors: "bg-indigo-100 text-indigo-800 border-indigo-300"
        };
      case "received":
        return {
          icon: <Loader className="h-3 w-3 mr-1" />,
          label: "Received",
          colors: "bg-purple-100 text-purple-800 border-purple-300"
        };
      case "completed":
        return {
          icon: <PackageCheck className="h-3 w-3 mr-1" />,
          label: "Completed",
          colors: "bg-green-100 text-green-800 border-green-300"
        };
      default:
        return {
          icon: <Clock className="h-3 w-3 mr-1" />,
          label: "Pending",
          colors: "bg-amber-100 text-amber-800 border-amber-300"
        };
    }
  };

  const { icon, label, colors } = getStatusConfig(status);

  return (
    <Badge 
      variant="outline" 
      className={cn("flex items-center", colors, className)}
    >
      {icon}
      {label}
    </Badge>
  );
}
