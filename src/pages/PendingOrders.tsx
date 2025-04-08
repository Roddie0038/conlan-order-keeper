
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useState, useEffect } from "react";
import { OrderForm } from "@/components/order-form";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { LogoutButton } from "@/components/LogoutButton";
import { 
  PendingOrdersHeader, 
  PendingOrdersTable, 
  PendingOrdersLayout 
} from "@/components/pending-orders";

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
  managerEmail?: string;
  plant?: string;
}

export default function PendingOrders() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    const savedOrders = localStorage.getItem('pendingOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      // Filter by both store and plant
      const filteredOrders = allOrders
        .filter((order: Order) => 
          order.store === user?.store && 
          (!order.plant || order.plant === selectedPlant)
        )
        .map((order: Order) => ({
          ...order,
          managerEmail: getManagerEmail(order.store)
        }));
      setOrders(filteredOrders);
    }
  }, [user?.store, selectedPlant]);
  
  const handleComplete = (orderId: string) => {
    const allPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const orderToComplete = allPendingOrders.find((o: Order) => o.id === orderId);
    if (orderToComplete) {
      const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      completedOrders.push({
        ...orderToComplete,
        managerEmail: getManagerEmail(orderToComplete.store),
        plant: selectedPlant
      });
      localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
      const updatedPendingOrders = allPendingOrders.filter((o: Order) => o.id !== orderId);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
      
      // Update local state
      setOrders(updatedPendingOrders
        .filter((order: Order) => 
          order.store === user?.store && 
          (!order.plant || order.plant === selectedPlant)
        )
        .map((order: Order) => ({
          ...order,
          managerEmail: getManagerEmail(order.store)
        }))
      );
    }
  };
  
  return (
    <PendingOrdersLayout>
      <LogoutButton />
      <PendingOrdersHeader />

      <main className="container space-y-8">
        <OrderForm />
        <PendingOrdersTable orders={orders} onComplete={handleComplete} />
      </main>
    </PendingOrdersLayout>
  );
}
