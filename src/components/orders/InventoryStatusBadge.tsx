import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Package, AlertTriangle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InventoryStatusBadgeProps {
  status: "available" | "low" | "out_of_stock";
  quantity?: number;
  lastUpdated?: string;
}

export function InventoryStatusBadge({ status, quantity, lastUpdated }: InventoryStatusBadgeProps) {
  const getBadgeContent = () => {
    switch (status) {
      case "available":
        return {
          icon: <Package className="h-3 w-3" />,
          label: "Available",
          className: "bg-green-50 text-green-700 border-green-300"
        };
      case "low":
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          label: "Low Stock",
          className: "bg-yellow-50 text-yellow-700 border-yellow-300"
        };
      case "out_of_stock":
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: "Out of Stock",
          className: "bg-red-50 text-red-700 border-red-300"
        };
    }
  };

  const { icon, label, className } = getBadgeContent();

  const tooltipContent = (
    <div className="space-y-1">
      {quantity !== undefined && (
        <p className="text-xs">Quantity: {quantity}</p>
      )}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })}
        </p>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`flex items-center gap-1.5 cursor-help ${className}`}>
            {icon}
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
