import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
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
export const MTOPendingOrders = () => {
  const [orders, setOrders] = useState<MTOOrder[]>([]);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const loadOrders = () => {
      const savedOrders = localStorage.getItem('mtoOrders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
    };
    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, []);
  const handleDelete = (orderId: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can delete orders.",
        variant: "destructive"
      });
      return;
    }
    const updatedOrders = orders.filter(order => order.id !== orderId);
    localStorage.setItem('mtoOrders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    toast({
      title: "Order Deleted",
      description: "The order has been successfully deleted."
    });
  };
  return <div className="mt-8 bg-white/90 p-6 rounded-lg shadow">
      <h2 className="mb-4 py-0 px-0 font-extrabold text-center text-3xl text-zinc-950">                                            Pending MTO Orders</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-gray-400 hover:bg-gray-300 rounded-full">Date</TableHead>
            <TableHead className="bg-gray-400 hover:bg-gray-300 rounded-full">Store</TableHead>
            <TableHead className="bg-gray-400 hover:bg-gray-300 rounded-full">Product</TableHead>
            <TableHead className="bg-gray-400 hover:bg-gray-300 rounded-full">Size</TableHead>
            <TableHead className="bg-gray-400 hover:bg-gray-300 rounded-full">Quantity</TableHead>
            <TableHead className="bg-gray-400 hover:bg-gray-300 rounded-full">Arrival</TableHead>
            {user?.isAdmin && <TableHead className="bg-gray-400 hover:bg-gray-300 rounded-full">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => <TableRow key={order.id}>
              <TableCell>{order.timestamp}</TableCell>
              <TableCell>{order.store}</TableCell>
              <TableCell>{order.productNumber}</TableCell>
              <TableCell>{order.tireSize}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{order.scheduleArrival}</TableCell>
              {user?.isAdmin && <TableCell>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(order.id)}>
                    Delete
                  </Button>
                </TableCell>}
            </TableRow>)}
        </TableBody>
      </Table>
    </div>;
};