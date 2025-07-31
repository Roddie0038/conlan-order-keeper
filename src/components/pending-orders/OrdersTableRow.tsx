
import { TableCell, TableRow } from "@/components/ui/table";
import { OrderRecord } from "@/types/orders";
import { StatusBadge } from "@/components/orders/StatusBadge";

interface OrdersTableRowProps {
  order: OrderRecord;
  onClick?: () => void;
}

export function OrdersTableRow({ order, onClick }: OrdersTableRowProps) {
  // Get order type display text
  const getOrderTypeDisplay = (order: OrderRecord): string => {
    if (order.order_type === 'MTO') return 'MTO';
    if (order.order_type === 'WHEEL_POWDER_COATING') return 'Wheel';
    if (order.cross_dock_type === 'Yes') return 'Cross-Dock';
    return 'Transfer';
  };

  return (
    <TableRow 
      onClick={onClick} 
      className={onClick ? "cursor-pointer hover:bg-slate-700/50" : ""}
    >
      <TableCell>{order.timestamp}</TableCell>
      <TableCell>{order.name || 'N/A'}</TableCell>
      <TableCell>{order.store || 'N/A'}</TableCell>
      <TableCell>{order.product_number || 'N/A'}</TableCell>
      <TableCell className="max-w-[200px] truncate">{order.description || 'N/A'}</TableCell>
      <TableCell>{order.quantity || 'N/A'}</TableCell>
      <TableCell>{order.schedule_arrival || 'N/A'}</TableCell>
      <TableCell>{getOrderTypeDisplay(order)}</TableCell>
      <TableCell>{order.cross_dock_destination || 'N/A'}</TableCell>
      <TableCell>
        <StatusBadge 
          status={order.completed ? 'completed' : (order.status as any || 'pending')} 
          outOfStock={order.out_of_stock}
        />
      </TableCell>
    </TableRow>
  );
}
