
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Order {
  id: string;
  timestamp: string;
  yourName?: string;
  store: string;
  dateReceived?: string;
  productNumber: string;
  description?: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock?: string;
  name?: string;
  casingGrade?: string;
  tireSize?: string;
  tireTreadNeeded?: string;
}

interface AllOrdersTableProps {
  orders: Order[];
  type: 'regular' | 'mto';
  onComplete: (orderId: string, type: 'regular' | 'mto') => void;
  onDelete: (orderId: string, type: 'regular' | 'mto') => void;
  isAdmin: boolean;
}

export function AllOrdersTable({ 
  orders, 
  type, 
  onComplete, 
  onDelete, 
  isAdmin 
}: AllOrdersTableProps) {
  if (type === 'regular') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-blue-300 hover:bg-blue-200 rounded-full">Date</TableHead>
            <TableHead className="bg-blue-300 hover:bg-blue-200 rounded-full">Store</TableHead>
            <TableHead className="bg-blue-300 hover:bg-blue-200 rounded-full">Product</TableHead>
            <TableHead className="bg-blue-300 hover:bg-blue-200 rounded-full">Description</TableHead>
            <TableHead className="bg-blue-300 hover:bg-blue-200 rounded-full">Quantity</TableHead>
            <TableHead className="bg-blue-300 hover:bg-blue-200 rounded-full">Schedule</TableHead>
            {isAdmin && <TableHead className="bg-blue-400 hover:bg-blue-300 rounded-full">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell className="bg-primary-DEFAULT">
                {new Date(order.dateReceived || order.timestamp).toLocaleDateString()}
              </TableCell>
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
                    >
                      Complete
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onDelete(order.id, 'regular')}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Store</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Tread</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Schedule</TableHead>
          {isAdmin && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map(order => (
          <TableRow key={order.id}>
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
                  >
                    Complete
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => onDelete(order.id, 'mto')}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
