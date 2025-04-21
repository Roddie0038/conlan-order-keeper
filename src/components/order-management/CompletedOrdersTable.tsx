
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface CompletedOrder {
  id: string;
  timestamp: string;
  yourName?: string;
  name?: string;
  store: string;
  dateReceived?: string;
  productNumber: string;
  description?: string;
  tireSize?: string;
  tireTreadNeeded?: string;
  quantity: string;
  scheduleArrival: string;
  notes?: string;
  crossDock?: string;
  completedAt: string;
  completedBy?: string;
}

interface CompletedOrdersTableProps {
  orders: CompletedOrder[];
  isAdmin: boolean;
  onDelete: (orderId: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  handleSort: (field: string) => void;
}

export function CompletedOrdersTable({
  orders,
  isAdmin,
  onDelete,
  sortField,
  sortDirection,
  handleSort
}: CompletedOrdersTableProps) {
  const ArrowDownUp = require("lucide-react").ArrowDownUp;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-200">
          <TableRow>
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handleSort('completedAt')}
            >
              <div className="flex items-center">
                Date Completed <ArrowDownUp className="ml-1 h-3 w-3" />
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
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handleSort('productNumber')}
            >
              <div className="flex items-center">
                Product <ArrowDownUp className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            <TableHead className="font-semibold text-slate-700">Description</TableHead>
            <TableHead 
              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
              onClick={() => handleSort('quantity')}
            >
              <div className="flex items-center">
                Quantity <ArrowDownUp className="ml-1 h-3 w-3" />
              </div>
            </TableHead>
            {isAdmin && (
              <TableHead className="font-semibold text-slate-700">
                Order Type
              </TableHead>
            )}
            {isAdmin && (
              <TableHead className="font-semibold text-slate-700">
                Completed By
              </TableHead>
            )}
            {isAdmin && (
              <TableHead className="text-right font-semibold text-slate-700">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 5} className="text-center py-8 text-slate-500">
                No completed orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => (
              <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <TableCell>{new Date(order.completedAt).toLocaleString()}</TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>{order.productNumber}</TableCell>
                <TableCell>{order.description || order.tireSize}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.tireTreadNeeded ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {order.tireTreadNeeded ? 'MTO Order' : 'Regular Order'}
                    </span>
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell>
                    {order.completedBy || 'Admin'}
                  </TableCell>
                )}
                {isAdmin && (
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(order.id)} 
                      className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 border-red-200 font-medium"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
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
