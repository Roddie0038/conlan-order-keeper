import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
export default function AllPendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [mtoOrders, setMTOOrders] = useState<MTOOrder[]>([]);
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  useEffect(() => {
    const loadOrders = () => {
      const savedOrders = localStorage.getItem('pendingOrders');
      const savedMTOOrders = localStorage.getItem('mtoOrders');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      }
      if (savedMTOOrders) {
        setMTOOrders(JSON.parse(savedMTOOrders));
      }
    };
    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, []);
  const handleComplete = (orderId: string, type: 'regular' | 'mto') => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can complete orders.",
        variant: "destructive"
      });
      return;
    }
    if (type === 'regular') {
      const allPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const orderToComplete = allPendingOrders.find((o: Order) => o.id === orderId);
      if (orderToComplete) {
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        completedOrders.push(orderToComplete);
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        const updatedPendingOrders = allPendingOrders.filter((o: Order) => o.id !== orderId);
        localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
        setOrders(updatedPendingOrders);
      }
    } else {
      const allMTOOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
      const orderToComplete = allMTOOrders.find((o: MTOOrder) => o.id === orderId);
      if (orderToComplete) {
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        completedOrders.push(orderToComplete);
        localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
        const updatedMTOOrders = allMTOOrders.filter((o: MTOOrder) => o.id !== orderId);
        localStorage.setItem('mtoOrders', JSON.stringify(updatedMTOOrders));
        setMTOOrders(updatedMTOOrders);
      }
    }
    toast({
      title: "Order Completed",
      description: "The order has been marked as complete."
    });
  };
  const handleDelete = (orderId: string, type: 'regular' | 'mto') => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can delete orders.",
        variant: "destructive"
      });
      return;
    }
    if (type === 'regular') {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
    } else {
      const updatedMTOOrders = mtoOrders.filter(order => order.id !== orderId);
      localStorage.setItem('mtoOrders', JSON.stringify(updatedMTOOrders));
      setMTOOrders(updatedMTOOrders);
    }
    toast({
      title: "Order Deleted",
      description: "The order has been successfully deleted."
    });
  };
  return <div className="min-h-screen bg-cover bg-center bg-fixed" style={{
    backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backgroundBlendMode: 'overlay'
  }}>
      <div className="container py-8">
        <div className="p-6 rounded-lg shadow bg-gray-500 hover:bg-gray-400">
          <h2 className="text-2xl font-bold mb-4">All Pending Orders</h2>
          
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">New Orders</TabsTrigger>
              <TabsTrigger value="mto">MTO Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="regular">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="bg-blue-300 hover:bg-blue-200">Date</TableHead>
                    <TableHead className="bg-blue-300 hover:bg-blue-200">Store</TableHead>
                    <TableHead className="bg-blue-300 hover:bg-blue-200">Product</TableHead>
                    <TableHead className="bg-blue-300 hover:bg-blue-200">Description</TableHead>
                    <TableHead className="bg-blue-300 hover:bg-blue-200">Quantity</TableHead>
                    <TableHead className="bg-blue-300 hover:bg-blue-200">Schedule</TableHead>
                    {user?.isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => <TableRow key={order.id}>
                      <TableCell className="bg-primary-DEFAULT">{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                      <TableCell>{order.store}</TableCell>
                      <TableCell>{order.productNumber}</TableCell>
                      <TableCell>{order.description}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.scheduleArrival}</TableCell>
                      {user?.isAdmin && <TableCell>
                          <div className="flex gap-2">
                            <Button variant="default" size="sm" onClick={() => handleComplete(order.id, 'regular')}>
                              Complete
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(order.id, 'regular')}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>}
                    </TableRow>)}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="mto">
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
                    {user?.isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mtoOrders.map(order => <TableRow key={order.id}>
                      <TableCell>{order.timestamp}</TableCell>
                      <TableCell>{order.store}</TableCell>
                      <TableCell>{order.productNumber}</TableCell>
                      <TableCell>{order.tireSize}</TableCell>
                      <TableCell>{order.tireTreadNeeded}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.scheduleArrival}</TableCell>
                      {user?.isAdmin && <TableCell>
                          <div className="flex gap-2">
                            <Button variant="default" size="sm" onClick={() => handleComplete(order.id, 'mto')}>
                              Complete
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(order.id, 'mto')}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>}
                    </TableRow>)}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
}