
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp } from "lucide-react";
import { CombinedOrder } from "../types";
import { getBadgeColor } from "../utils/badgeUtils";

interface OrdersTableContentProps {
  orders: CombinedOrder[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
  showCompletedAt?: boolean;
  onOrderClick?: (order: CombinedOrder) => void;
  highlightOrder?: string | null;
  firstMatchRef?: React.RefObject<HTMLTableRowElement>;
}

export function OrdersTableContent({
  orders,
  sortField,
  sortDirection,
  handleSort,
  showCompletedAt = false,
  onOrderClick,
  highlightOrder,
  firstMatchRef
}: OrdersTableContentProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-200">
          <TableRow>
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handleSort(showCompletedAt ? 'completedAt' : 'timestamp')}
            >
              <div className="flex items-center">
                {showCompletedAt ? 'Date Completed' : 'Date'} <ArrowDownUp className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handleSort('store')}
            >
              <div className="flex items-center">
                Store <ArrowDownUp className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="font-semibold text-slate-700">Type</TableHead>
            <TableHead className="font-semibold text-slate-700">Product</TableHead>
            <TableHead className="font-semibold text-slate-700">Description</TableHead>
            <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
            {!showCompletedAt && <TableHead className="font-semibold text-slate-700">Status</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCompletedAt ? 6 : 7} className="text-center py-8 text-slate-500">
                No {showCompletedAt ? 'completed' : 'pending'} orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => {
              const isHighlighted = highlightOrder && order.productNumber === highlightOrder;
              const isFirstMatch = isHighlighted && index === 0;
              
              return (
                <TableRow 
                  key={order.id}
                  ref={isFirstMatch ? firstMatchRef : null}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} ${
                    onOrderClick ? 'cursor-pointer hover:bg-blue-50 transition-colors' : ''
                  } ${isHighlighted ? 'ring-2 ring-primary/60 bg-primary/5' : ''}`}
                  onClick={() => onOrderClick?.(order)}
                >
                <TableCell>
                  {showCompletedAt ? (
                    order.completedAt ? 
                      new Date(order.completedAt).toLocaleString() : 
                      'N/A'
                  ) : (
                    new Date(order.timestamp).toLocaleDateString()
                  )}
                </TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>
                  <Badge className={`${getBadgeColor(order.orderType)} text-white`}>
                    {order.orderType}
                  </Badge>
                </TableCell>
                <TableCell>{order.productNumber}</TableCell>
                <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                {!showCompletedAt && (
                  <TableCell>
                    <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                )}
              </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
