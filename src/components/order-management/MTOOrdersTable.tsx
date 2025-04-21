
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Trash2 } from "lucide-react";

interface MTOOrder {
  id: string;
  timestamp: string;
  store: string;
  name: string;
  productNumber: string;
  casingGrade: string;
  tireSize: string;
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
}

interface MTOOrdersTableProps {
  orders: MTOOrder[];
  isAdmin: boolean;
  onComplete: (orderId: string, type: 'regular' | 'mto') => void;
  onDelete: (orderId: string, type: 'regular' | 'mto') => void;
}

export function MTOOrdersTable({
  orders,
  isAdmin,
  onComplete,
  onDelete,
}: MTOOrdersTableProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-200">
          <TableRow>
            <TableHead className="font-semibold text-slate-700">Date</TableHead>
            <TableHead className="font-semibold text-slate-700">Store</TableHead>
            <TableHead className="font-semibold text-slate-700">Product</TableHead>
            <TableHead className="font-semibold text-slate-700">Size</TableHead>
            <TableHead className="font-semibold text-slate-700">Tread</TableHead>
            <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
            <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
            {isAdmin && <TableHead className="font-semibold text-slate-700">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-slate-500">
                No MTO orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order, index) => (
              <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <TableCell>{order.timestamp}</TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>{order.productNumber}</TableCell>
                <TableCell>{order.tireSize}</TableCell>
                <TableCell>{order.tireTreadNeeded}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.scheduleArrival}</TableCell>
                {isAdmin && (
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => onComplete(order.id, 'mto')}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Complete
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onDelete(order.id, 'mto')}
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
