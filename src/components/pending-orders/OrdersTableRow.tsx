
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderRecord } from "@/hooks/useFetchOrders";
import { StatusBadge } from "@/components/orders/StatusBadge";

interface OrdersTableRowProps {
  order: OrderRecord;
}

export function OrdersTableRow({ order }: OrdersTableRowProps) {
  // Function to get status badge color
  const getStatusBadge = (status: string | undefined, completed: boolean) => {
    if (completed) return "bg-green-500 hover:bg-green-600";
    if (!status) return "bg-gray-500 hover:bg-gray-600";
    
    switch(status.toLowerCase()) {
      case "pending": return "bg-yellow-500 hover:bg-yellow-600";
      case "in_transit": return "bg-blue-500 hover:bg-blue-600";
      case "ready_to_ship": return "bg-purple-500 hover:bg-purple-600";
      case "received": return "bg-cyan-500 hover:bg-cyan-600";
      case "completed": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <TableRow>
      <TableCell>{order.timestamp}</TableCell>
      <TableCell>{order.name || 'N/A'}</TableCell>
      <TableCell>{order.store || 'N/A'}</TableCell>
      <TableCell>{order.product_number || 'N/A'}</TableCell>
      <TableCell className="max-w-[200px] truncate">{order.description || 'N/A'}</TableCell>
      <TableCell>{order.quantity || 'N/A'}</TableCell>
      <TableCell>{order.schedule_arrival || 'N/A'}</TableCell>
      <TableCell>{order.order_type || 'Transfer'}</TableCell>
      <TableCell>{order.cross_dock_destination || 'N/A'}</TableCell>
      <TableCell>
        <Badge className={getStatusBadge(order.status, Boolean(order.completed))}>
          {order.completed ? 'Completed' : (order.status || 'Pending')}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
