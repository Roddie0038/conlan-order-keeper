import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { InventoryCacheItem } from "@/services/inventoryCacheService";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface InventoryDashboardTableProps {
  inventory: InventoryCacheItem[];
  loading: boolean;
}

export function InventoryDashboardTable({ inventory, loading }: InventoryDashboardTableProps) {
  const getStatusBadge = (item: InventoryCacheItem) => {
    if (item.quantity === 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Out of Stock
        </Badge>
      );
    }
    
    if (item.low_stock) {
      return (
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      );
    }

    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Available
      </Badge>
    );
  };

  const getQuantityClass = (item: InventoryCacheItem) => {
    if (item.quantity === 0) return "text-destructive font-semibold";
    if (item.low_stock) return "text-warning font-semibold";
    return "text-foreground";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <XCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No inventory items found</p>
        <p className="text-sm">Try adjusting your filters or search term</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Number</TableHead>
            <TableHead>Plant</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Min Threshold</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inventory.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.product_number}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.plant}</Badge>
              </TableCell>
              <TableCell className={`text-right ${getQuantityClass(item)}`}>
                {item.quantity}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {item.min_threshold || 'N/A'}
              </TableCell>
              <TableCell>{getStatusBadge(item)}</TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(item.last_updated_at), 'MMM d, yyyy HH:mm')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
