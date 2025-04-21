
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

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
      const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]').map((order: any) => ({
        ...order,
        type: "TRANSFER"
      }));
      
      const mtoOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]').map((order: any) => ({
        ...order,
        type: "MTO"
      }));
      
      const wheelOrders = JSON.parse(localStorage.getItem('wheelOrders') || '[]').map((order: any) => ({
        ...order,
        type: "WHEEL_POWDER_COATING"
      }));
      
      // Combine and filter orders
      const allOrders = [...pendingOrders, ...mtoOrders, ...wheelOrders]
        .filter(order => {
          const orderDate = format(new Date(order.timestamp || order.dateReceived), 'yyyy-MM-dd');
          return orderDate === targetDate && order.store === targetStore;
        });
      
      setOrders(allOrders);
    };
    
    loadOrders();
  }, [targetDate, targetStore]);

  const formattedDate = format(new Date(targetDate), 'MMMM do, yyyy');

  if (orders.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 flex flex-col items-center justify-center p-10">
          <Calendar className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-600 text-center">No orders found for {targetStore} on {formattedDate}</p>
          <p className="text-slate-500 text-sm mt-2 text-center">Try checking a different date or store.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-600" />
          Orders from {targetStore}
        </CardTitle>
        <CardDescription>{formattedDate}</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Time</TableHead>
                <TableHead className="font-semibold text-slate-700">Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Product Number</TableHead>
                <TableHead className="font-semibold text-slate-700">Description</TableHead>
                <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order, index) => (
                <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <TableCell>
                    {format(new Date(order.timestamp || order.dateReceived), 'h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      order.type === "MTO" ? "bg-blue-100 text-blue-800" :
                      order.type === "WHEEL_POWDER_COATING" ? "bg-purple-100 text-purple-800" :
                      "bg-green-100 text-green-800"
                    }>
                      {order.type === "MTO" ? "MTO" : 
                       order.type === "WHEEL_POWDER_COATING" ? "Wheel" : 
                       "Transfer"}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.productNumber}</TableCell>
                  <TableCell>{order.description || order.tireSize || order.tireTreadNeeded || ""}</TableCell>
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
