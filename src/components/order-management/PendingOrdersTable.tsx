
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2 } from "lucide-react";

interface Order {
  id: string;
  timestamp: string;
  yourName: string;
  store: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock: string;
}

interface PendingOrdersTableProps {
  orders: Order[];
  isAdmin: boolean;
  onComplete: (orderId: string, type: 'regular' | 'mto') => void;
  onDelete: (orderId: string, type: 'regular' | 'mto') => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handlePendingSort: (field: string) => void;
}

export function PendingOrdersTable({
  orders,
  isAdmin,
  onComplete,
  onDelete,
  sortField,
  sortDirection,
  handlePendingSort,
}: PendingOrdersTableProps) {
  const ArrowDownUp = require("lucide-react").ArrowDownUp;
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-200">
          <TableRow>
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handlePendingSort('dateReceived')}
            >
              <div className="flex items-center">
                Date <ArrowDownUp className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handlePendingSort('store')}
            >
              <div className="flex items-center">
                Store <ArrowDownUp className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handlePendingSort('productNumber')}
            >
              <div className="flex items-center">
                Product <ArrowDownUp className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="font-semibold text-slate-700">Description</TableHead>
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handlePendingSort('quantity')}
            >
              <div className="flex items-center">
                Quantity <ArrowDownUp className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
            {isAdmin && <TableHead className="font-semibold text-slate-700">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-slate-500">
                No pending orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => (
              <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <TableCell>{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>{order.productNumber}</TableCell>
                <TableCell>{order.description}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.scheduleArrival}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => onComplete(order.id, 'regular')}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onDelete(order.id, 'regular')}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
