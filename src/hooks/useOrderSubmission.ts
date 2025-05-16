
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { submitToGoogleSheets } from "@/services/sheets";
import { submitToWebhook } from "@/services/webhook/utils";
import { saveOrderToSupabase } from "@/services/orderService";
import { storeData } from "@/config/storeData";
import { getManagerEmail } from "@/components/order-form/formConfig";

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
  dateReceived?: string; // Added dateReceived field
  [key: string]: any;
};

export function useOrderSubmission() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedPlant, PLANT_WEBHOOKS } = usePlant();
  const isAdmin = user?.isAdmin || false;

  // Helper function for order processing logic
  const processOrder = async (order: OrderSummary) => {
    console.log("🔍 SUBMIT - Processing order:", order.id);
    
    // Find the store manager email from storeData
    const storeNumber = order.store.match(/\d+$/)?.[0] || "";
    const matchedStore = storeData.find(s => s.storeNumber === storeNumber);
    const storeManagerEmail = matchedStore?.managerEmails || "";
    
    // Ensure proper plant information is included
    const orderWithPlant = {
      ...order,
      plant: selectedPlant,
      type: 'TRANSFER', // Explicitly set the order type
      name: order.yourName || order.name || user?.username || "Unknown", // Ensure name is set
      email: storeManagerEmail, // Ensure email is set with the manager's email
      dateReceived: order.dateReceived || new Date().toISOString(), // Add dateReceived
      crossDock: (order.crossDock === "Yes" ? "Yes" : "No") as "Yes" | "No" // Ensure crossDock is correctly typed
    };
    
    console.log("🔍 SUBMIT - Using sheets service with order:", orderWithPlant);
    const result = await submitToGoogleSheets(orderWithPlant);
    console.log("🔍 SUBMIT - submitToGoogleSheets result:", result);
    
    // Save the order to Supabase
    console.log("🔍 SUBMIT - Saving order to Supabase:", orderWithPlant);
    const { data, error } = await saveOrderToSupabase(orderWithPlant);
    
    if (error) {
      console.error("❌ SUBMIT - Error saving to Supabase:", error);
      throw error;
    } else {
      console.log("✅ SUBMIT - Successfully saved to Supabase:", data);
    }
    
    return orderWithPlant;
  };

  // Helper function for webhook processing
  const processWebhook = async (order: OrderSummary, testMode: boolean) => {
    if (!isAdmin) return;
    
    console.log("🔍 SUBMIT - Admin user submitting order to plant:", selectedPlant);
    
    let webhookUrl;
    if (testMode) {
      // Use the plant-specific webhook for test mode
      webhookUrl = PLANT_WEBHOOKS[selectedPlant]?.transferRequests;
      console.log("🔍 SUBMIT - Admin in test mode, using plant-specific webhook:", webhookUrl);
    } else {
      // Use the admin-specific webhook for production mode
      webhookUrl = PLANT_WEBHOOKS[selectedPlant]?.adminOrders;
      console.log("🔍 SUBMIT - Admin in production mode, using admin webhook:", webhookUrl);
    }
    
    if (webhookUrl) {
      console.log("🔍 SUBMIT - Sending to webhook:", webhookUrl);
      await submitToWebhook(webhookUrl, order);
    } else {
      console.error("❌ SUBMIT - No webhook URL found for this configuration");
    }
  };

  // Helper function for storing orders in local storage
  const storeCompletedOrders = (orders: OrderSummary[]) => {
    const timestamp = new Date().toLocaleString();
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    
    const newCompletedOrders = orders.map(order => ({
      ...order,
      id: order.id,
      timestamp: timestamp,
      plant: selectedPlant
    }));
    
    localStorage.setItem('completedOrders', JSON.stringify([...completedOrders, ...newCompletedOrders]));
  };

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
          const processedOrder = await processOrder(order);
          processedOrders.push(processedOrder);
          
          // Handle webhook submission for admin users
          await processWebhook(processedOrder, testMode);
        } catch (error) {
          console.error(`Error processing order ${order.id}:`, error);
          // Continue with other orders even if one fails
        }
      }
      
      // Store successfully processed orders in local storage
      storeCompletedOrders(processedOrders);
      
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
