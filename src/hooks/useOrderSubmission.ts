
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PLANT_WEBHOOKS } from "@/contexts/PlantContext";
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
  destinationPlant?: string;
  destinationManagerEmail?: string;
  [key: string]: any;
};

export function useOrderSubmission() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;

  const handleSubmitOrders = async (
    selectedOrders: OrderSummary[],
    testMode: boolean,
    destinationPlant: string,
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
    console.log("✅ Order submitted to plant:", destinationPlant);
    
    try {
      console.log("🔍 SUBMIT - Processing orders with enhanced error handling");
      const processedOrders: OrderSummary[] = [];
      const failedOrders: { order: OrderSummary; error: string }[] = [];
      
      for (const order of selectedOrders) {
        try {
          console.log(`🔍 SUBMIT - Processing order ${order.id}...`);
          
          const processedOrder = await processOrder(order, destinationPlant);
          processedOrders.push(processedOrder);
          
          console.log(`✅ SUBMIT - Successfully processed order ${order.id}`);
          
          // Process webhook for successfully processed orders
          await processWebhook(
            processedOrder, 
            true, // Always send notifications
            isAdmin, 
            destinationPlant, 
            PLANT_WEBHOOKS
          );
          
          console.log(`✅ SUBMIT - Successfully sent webhook for order ${order.id}`);
          
        } catch (error) {
          console.error(`❌ SUBMIT - Error processing order ${order.id}:`, error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          failedOrders.push({ order, error: errorMessage });
          
          // Check if this is a Supabase RLS error
          if (errorMessage.includes('row-level security') || errorMessage.includes('42501')) {
            console.error(`❌ SUBMIT - RLS Error for order ${order.id}:`, {
              orderId: order.id,
              store: order.store,
              error: errorMessage,
              context: 'This may be due to authentication or store format issues'
            });
          }
        }
      }
      
      // Store successfully processed orders
      if (processedOrders.length > 0) {
        storeCompletedOrders(processedOrders, destinationPlant);
        onSuccess(processedOrders);
      }
      
      // Show appropriate toast messages
      if (processedOrders.length === selectedOrders.length) {
        // All orders succeeded
        toast({
          title: "🚚 Transfer request submitted! 🚚",
          description: `${processedOrders.length} transfer order(s) have been submitted successfully and are being processed.`
        });
      } else if (processedOrders.length > 0) {
        // Partial success
        toast({
          title: "⚠️ Partial Success",
          description: `${processedOrders.length} of ${selectedOrders.length} orders submitted successfully. ${failedOrders.length} orders failed.`,
          variant: "destructive"
        });
        
        // Log failed orders for debugging
        console.error("❌ SUBMIT - Failed orders summary:", failedOrders);
      } else {
        // All orders failed
        toast({
          title: "❌ All Orders Failed",
          description: `None of the ${selectedOrders.length} orders could be submitted. Please check the console for details.`,
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error("❌ SUBMIT - Critical error in order submission:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Error submitting orders",
        description: `Critical error: ${errorMessage}. Please try again or contact support.`,
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
