
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { processOrder } from "@/services/orderSubmission/processOrder";
import { processWebhook } from "@/services/orderSubmission/processWebhook";
import { storeCompletedOrders } from "@/services/orderSubmission/storeStorage";

export type OrderSummary = {
  id: string;
  selected: boolean;
  store: string;
  yourName?: string;
  name?: string;
  timestamp?: string;
  productNumber?: string;
  description?: string;
  quantity?: string | number;
  scheduleArrival?: string;
  notes?: string;
  crossDock?: string;
  crossDockDestination?: string;
  receiverNo?: string;
  etaDate?: string;
  dateReceived?: string;
  [key: string]: any;
};

export function useOrderSubmission() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedPlant, PLANT_WEBHOOKS } = usePlant();
  const isAdmin = user?.isAdmin || false;

  // Main submission handler
  const handleSubmitOrders = async (
    selectedOrders: OrderSummary[],
    testMode: boolean,
    onSuccess: (orders: OrderSummary[]) => void
  ) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select at least one order to submit",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log("🔍 SUBMIT - Starting order submission process");
    console.log("🔍 SUBMIT - Admin user:", isAdmin);
    console.log("🔍 SUBMIT - Test mode:", testMode);
    console.log("🔍 SUBMIT - Selected plant:", selectedPlant);
    
    try {
      // Admin test mode notification
      if (isAdmin && !testMode) {
        toast({
          title: "Admin Test Mode",
          description: "Order submission processed in test mode - no notifications will be sent."
        });
        
        console.log("🔍 SUBMIT - Admin test mode active, not sending notifications");
        
        // Store in local storage but don't trigger webhooks
        const timestamp = new Date().toLocaleString();
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        
        const adminTestOrders = selectedOrders.map(order => ({
          ...order,
          id: order.id,
          timestamp: timestamp,
          testMode: true
        }));
        
        localStorage.setItem('completedOrders', JSON.stringify([...completedOrders, ...adminTestOrders]));
        
        // Call success callback
        onSuccess(selectedOrders);
        
        setIsSubmitting(false);
        return;
      }

      console.log("🔍 SUBMIT - Processing orders with notifications");
      // Normal submission process
      const processedOrders: OrderSummary[] = [];
      
      for (const order of selectedOrders) {
        try {
          const processedOrder = await processOrder(order, selectedPlant);
          processedOrders.push(processedOrder);
          
          // Handle webhook submission for admin users
          await processWebhook(
            processedOrder, 
            testMode, 
            isAdmin, 
            selectedPlant, 
            PLANT_WEBHOOKS
          );
        } catch (error) {
          console.error(`Error processing order ${order.id}:`, error);
          // Continue with other orders even if one fails
        }
      }
      
      // Store successfully processed orders in local storage
      storeCompletedOrders(processedOrders, selectedPlant);
      
      // Call success callback with processed orders
      onSuccess(processedOrders);
      
      toast({
        title: "Orders submitted successfully",
        description: `${processedOrders.length} order(s) have been submitted successfully.`
      });
    } catch (error) {
      console.error("❌ SUBMIT - Error submitting orders:", error);
      toast({
        title: "Error submitting orders",
        description: "There was an error submitting the orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitOrders
  };
}
