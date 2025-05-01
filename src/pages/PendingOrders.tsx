
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
import { RecentOrders } from "@/components/orders/RecentOrders";

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
  crossDockDestination?: string;
  receiverNo?: string;
  etaDate?: string;
  destinationManagerEmail?: string;
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
      const filteredOrders = allOrders
        .filter((order: Order) => 
          order.store === user?.store && 
          (!order.plant || order.plant === selectedPlant)
        )
        .map((order: Order) => {
          // Ensure we have manager email
          const managerEmail = order.managerEmail || getManagerEmail(order.store);
          
          // Add destination manager email if missing but have cross dock destination
          let destEmail = order.destinationManagerEmail;
          if (order.crossDock === "Yes" && order.crossDockDestination && !destEmail) {
            destEmail = getManagerEmail(order.crossDockDestination);
          }
          
          return {
            ...order,
            managerEmail,
            destinationManagerEmail: destEmail
          };
        });
      setOrders(filteredOrders);
    }
  }, [user?.store, selectedPlant]);
  
  const handleComplete = (orderId: string) => {
    const allPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const orderToComplete = allPendingOrders.find((o: Order) => o.id === orderId);
    if (orderToComplete) {
      // Ensure destination manager email is set for cross dock orders
      if (orderToComplete.crossDock === "Yes" && orderToComplete.crossDockDestination && !orderToComplete.destinationManagerEmail) {
        orderToComplete.destinationManagerEmail = getManagerEmail(orderToComplete.crossDockDestination);
      }
      
      const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      completedOrders.push({
        ...orderToComplete,
        managerEmail: orderToComplete.managerEmail || getManagerEmail(orderToComplete.store),
        plant: selectedPlant
      });
      localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
      const updatedPendingOrders = allPendingOrders.filter((o: Order) => o.id !== orderId);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
      
      setOrders(updatedPendingOrders
        .filter((order: Order) => 
          order.store === user?.store && 
          (!order.plant || order.plant === selectedPlant)
        )
        .map((order: Order) => ({
          ...order,
          managerEmail: order.managerEmail || getManagerEmail(order.store),
          destinationManagerEmail: order.destinationManagerEmail || 
            (order.crossDock === "Yes" && order.crossDockDestination ? 
              getManagerEmail(order.crossDockDestination) : undefined)
        }))
      );
    }
  };
  
  return (
    <PendingOrdersLayout>
      <LogoutButton />
      <PendingOrdersHeader />

      <main className="container space-y-8">
        <RecentOrders />
        <OrderForm />
        <PendingOrdersTable orders={orders} onComplete={handleComplete} />
      </main>
    </PendingOrdersLayout>
  );
}
