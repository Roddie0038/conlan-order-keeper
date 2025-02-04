import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { OrderForm } from "@/components/OrderForm";

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

export default function PendingOrders() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from your backend
    const savedOrders = localStorage.getItem('pendingOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      // Filter orders for the current store
      setOrders(allOrders.filter((order: Order) => order.store === user?.store));
    }
  }, [user?.store]);

  const handleComplete = (orderId: string) => {
    // Move order to completed
    const allPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const orderToComplete = allPendingOrders.find((o: Order) => o.id === orderId);
    
    if (orderToComplete) {
      // Add to completed orders
      const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      completedOrders.push(orderToComplete);
      localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
      
      // Remove from pending
      const updatedPendingOrders = allPendingOrders.filter((o: Order) => o.id !== orderId);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
      
      // Update state
      setOrders(updatedPendingOrders.filter((order: Order) => order.store === user?.store));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backgroundBlendMode: 'overlay',
      }}
    >
      <header className="bg-primary/90 text-primary-foreground py-6 mb-8 backdrop-blur-sm">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png"
              alt="Conlan Tire Logo"
              className="h-16 object-contain"
            />
            <h1 className="text-2xl font-bold">New Order Form - {user?.store}</h1>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/completed-orders')}
              className="border-[#F97316] border-2 font-bold text-black hover:bg-[#F97316] hover:text-white"
            >
              View Completed Orders
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-[#F97316] border-2 font-bold text-black hover:bg-[#F97316] hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container space-y-8">
        <OrderForm />
        
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Pending Orders</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                  <TableCell>{order.productNumber}</TableCell>
                  <TableCell>{order.description}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleComplete(order.id)}
                    >
                      Mark Complete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}