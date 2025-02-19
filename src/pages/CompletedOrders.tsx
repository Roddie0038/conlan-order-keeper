import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const savedOrders = localStorage.getItem('completedOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      const filteredOrders = user?.isAdmin ? allOrders : allOrders.filter((order: Order) => order.store === user?.store);
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
      const filteredOrders = user?.isAdmin ? updatedOrders : updatedOrders.filter((order: Order) => order.store === user?.store);
      setOrders(filteredOrders);
    }
  };
  return <div className="min-h-screen" style={{
    backgroundImage: "url('/lovable-uploads/310fc0d8-29ad-4965-98d1-a236b46f73e8.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
  }}>
      <header className="bg-primary/90 text-primary-foreground py-6 mb-8 backdrop-blur-sm rounded-full">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" alt="Conlan Tire Logo" className="h-16 object-contain" />
            <h1 className="font-extrabold text-4xl text-center">
              Completed Orders - {user?.isAdmin ? 'Admin View' : user?.store}
            </h1>
          </div>
          <div className="flex gap-4">
            
            <Button variant="outline" onClick={handleLogout} className="border-orange-500 text-black font-bold hover:bg-orange-500 hover:text-white">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="p-6 rounded-lg shadow backdrop-blur-sm bg-gray-500 hover:bg-gray-400">
          <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="bg-gray-300 hover:bg-gray-200">Date Completed</TableHead>
                <TableHead className="bg-slate-300 hover:bg-slate-200">Store</TableHead>
                <TableHead className="bg-slate-300 hover:bg-slate-200">Product</TableHead>
                <TableHead className="bg-slate-300 hover:bg-slate-200">Description</TableHead>
                <TableHead className="bg-slate-300 hover:bg-slate-200">Quantity</TableHead>
                {user?.isAdmin && <TableHead className="text-right bg-slate-300 hover:bg-slate-200">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => <TableRow key={order.id}>
                  <TableCell>{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                  <TableCell>{order.store}</TableCell>
                  <TableCell>{order.productNumber}</TableCell>
                  <TableCell>{order.description}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  {user?.isAdmin && <TableCell className="text-right">
                      <Button variant="outline" onClick={() => handleDelete(order.id)} className="bg-red-600 text-black font-bold hover:bg-red-700 hover:text-white">
                        Delete
                      </Button>
                    </TableCell>}
                </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>;
}