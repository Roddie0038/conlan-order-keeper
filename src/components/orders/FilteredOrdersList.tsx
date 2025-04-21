
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface Order {
  id: string;
  timestamp: string;
  store: string;
  type: "MTO" | "WHEEL_POWDER_COATING" | "TRANSFER";
  productNumber: string;
  description: string;
  quantity: string;
}

interface FilteredOrdersListProps {
  targetDate?: string;
  targetStore?: string;
  className?: string;
}

export function FilteredOrdersList({ 
  targetDate = "2025-04-18", 
  targetStore = "Tulsa 36",
  className = ""
}: FilteredOrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Load all orders from localStorage
    const loadOrders = () => {
      // Load from all order types
      const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const mtoOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
      const wheelOrders = JSON.parse(localStorage.getItem('wheelOrders') || '[]');
      
      // Combine and filter orders
      const allOrders = [...pendingOrders, ...mtoOrders, ...wheelOrders]
        .filter(order => {
          const orderDate = format(new Date(order.timestamp), 'yyyy-MM-dd');
          return orderDate === targetDate && order.store === targetStore;
        });
      
      setOrders(allOrders);
    };
    
    loadOrders();
  }, [targetDate, targetStore]);

  if (orders.length === 0) {
    return (
      <div className={`text-center p-8 bg-slate-50 rounded-lg ${className}`}>
        <p className="text-slate-600">No orders found for {targetStore} on {format(new Date(targetDate), 'MMMM do, yyyy')}</p>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        <h2 className="text-2xl font-bold">
          Orders from {targetStore} - {format(new Date(targetDate), 'MMMM do, yyyy')}
        </h2>
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product Number</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    {format(new Date(order.timestamp), 'h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      order.type === "MTO" ? "bg-blue-500" :
                      order.type === "WHEEL_POWDER_COATING" ? "bg-purple-500" :
                      "bg-green-500"
                    }>
                      {order.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.productNumber}</TableCell>
                  <TableCell>{order.description}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
