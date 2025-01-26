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

export default function CompletedOrders() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem('completedOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      // If admin, show all orders, otherwise filter by store
      const filteredOrders = user?.isAdmin 
        ? allOrders 
        : allOrders.filter((order: Order) => order.store === user?.store);
      setOrders(filteredOrders);
    }
  }, [user?.store, user?.isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDelete = (orderId: string) => {
    const savedOrders = localStorage.getItem('completedOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      const updatedOrders = allOrders.filter((order: Order) => order.id !== orderId);
      localStorage.setItem('completedOrders', JSON.stringify(updatedOrders));
      // If admin, show all orders, otherwise filter by store
      const filteredOrders = user?.isAdmin 
        ? updatedOrders 
        : updatedOrders.filter((order: Order) => order.store === user?.store);
      setOrders(filteredOrders);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground py-6 mb-8">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png"
              alt="Conlan Tire Logo"
              className="h-16 object-contain"
            />
            <h1 className="text-2xl font-bold">
              Completed Orders - {user?.isAdmin ? 'Admin View' : user?.store}
            </h1>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/pending-orders')}
              className="border-orange-500 text-black font-bold hover:bg-orange-500 hover:text-white"
            >
              View Pending Orders
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-orange-500 text-black font-bold hover:bg-orange-500 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date Completed</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                {user?.isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                  <TableCell>{order.store}</TableCell>
                  <TableCell>{order.productNumber}</TableCell>
                  <TableCell>{order.description}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  {user?.isAdmin && (
                    <TableCell className="text-right">
                      <Button 
                        variant="outline"
                        onClick={() => handleDelete(order.id)}
                        className="bg-red-600 text-black font-bold hover:bg-red-700 hover:text-white"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}