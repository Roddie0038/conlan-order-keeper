
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PendingOrdersLayout,
  PendingOrdersHeader 
} from "@/components/pending-orders";
import { AllOrdersTable } from "@/components/pending-orders/AllOrdersTable";

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
  const { user } = useAuth();
  const { toast } = useToast();
  
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

  return (
    <PendingOrdersLayout>
      <div className="container py-8">
        <PendingOrdersHeader />
        
        <div className="p-6 shadow bg-gray-500 hover:bg-gray-400 rounded-full mt-8">
          <h2 className="mb-4 text-center font-bold text-4xl text-amber-300">All Pending Orders</h2>
          
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">New Orders</TabsTrigger>
              <TabsTrigger value="mto">MTO Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="regular">
              <AllOrdersTable 
                orders={orders}
                type="regular"
                onComplete={handleComplete}
                onDelete={handleDelete}
                isAdmin={!!user?.isAdmin}
              />
            </TabsContent>

            <TabsContent value="mto">
              <AllOrdersTable 
                orders={mtoOrders}
                type="mto"
                onComplete={handleComplete}
                onDelete={handleDelete}
                isAdmin={!!user?.isAdmin}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PendingOrdersLayout>
  );
}
