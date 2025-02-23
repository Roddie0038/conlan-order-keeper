
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/Navigation";

interface CompletedOrder {
  id: string;
  timestamp: string;
  store: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
}

export default function CompletedOrders() {
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadOrders = () => {
      const savedOrders = localStorage.getItem('completedOrders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        const filteredOrders = user?.isAdmin 
          ? parsedOrders 
          : parsedOrders.filter((order: CompletedOrder) => order.store === user?.store);
        setOrders(filteredOrders);
      }
    };

    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, [user]);

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{
      backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'overlay'
    }}>
      <Navigation />
      
      <div className="container py-8">
        <div className="p-6 shadow bg-gray-500 hover:bg-gray-400 rounded-full">
          <h2 className="mb-4 text-center font-bold text-4xl text-amber-300">Completed Orders</h2>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Schedule</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                  <TableCell>{order.store}</TableCell>
                  <TableCell>{order.productNumber}</TableCell>
                  <TableCell>{order.description}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.scheduleArrival}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
