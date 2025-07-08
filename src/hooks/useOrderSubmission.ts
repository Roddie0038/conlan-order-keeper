
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { processOrder } from "@/services/orderSubmission/processOrder";
import { processWebhook } from "@/services/orderSubmission/processWebhook";
import { storeCompletedOrders } from "@/services/orderSubmission/storeStorage";
import type { OrderData } from "@/types/supabase-extensions";

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
      console.log("🔍 SUBMIT - Processing orders with notifications");
      // Submit all orders with notifications enabled
      const processedOrders: OrderSummary[] = [];
      
      for (const order of selectedOrders) {
        try {
          const processedOrder = await processOrder(order, selectedPlant);
          processedOrders.push(processedOrder);
          
          // Always process webhook for all orders regardless of admin status
          await processWebhook(
            processedOrder, 
            true, // Always send notifications (testMode=true)
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
        title: "🚚 Transfer request submitted! 🚚",
        description: `${processedOrders.length} transfer order(s) have been submitted successfully and are being processed.`
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
