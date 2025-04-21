
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Order {
  id: string;
  timestamp: string;
  store: string;
  type: "MTO" | "WHEEL_POWDER_COATING" | "TRANSFER";
  productNumber: string;
  description: string;
  quantity: string;
}

export function FilteredOrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Load all orders from localStorage
    const loadOrders = () => {
      const targetDate = "2025-04-18";
      const targetStore = "Tulsa 36";
      
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
  }, []);

  if (orders.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-lg">
        <p className="text-slate-600">No orders found for Tulsa 36 on April 18th, 2025</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        Orders from Tulsa 36 - April 18th, 2025
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
    </div>
  );
}
