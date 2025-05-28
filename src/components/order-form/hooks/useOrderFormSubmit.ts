
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/hooks/use-toast";
import { OrderFormValues } from "../order-form-schema";
import { OrderSummary } from "../types";
import { saveOrderToSupabase } from "@/services/orderService";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";
import { storeData } from "@/config/storeData";
import { getPlantForStore } from "@/utils/plantMapping";
import type { OrderData } from "@/types/supabase-extensions";

export function useOrderFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const { toast } = useToast();

  const handleSubmitOrders = async (
    selectedOrders: OrderSummary[],
    onSuccess?: () => void
  ) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select at least one order to submit.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the orders for submission
      const formattedOrders: OrderData[] = selectedOrders.map((order) => {
        // Find the store manager email from storeData
        const storeNumber = order.store.match(/\d+$/)?.[0] || "";
        const matchedStore = storeData.find(s => s.storeNumber === storeNumber);
        const storeManagerEmail = matchedStore?.managerEmails || "";
        
        // Determine plant based on store
        const plant = getPlantForStore(order.store);
        
        // Use proper Supabase database column names
        return {
          yourName: order.yourName,
          name: order.yourName, // Explicitly set name to yourName for better identification
          store: order.store,
          dateReceived: order.dateReceived,
          product_number: order.productNumber, // Use correct property name
          description: order.description,
          quantity: parseInt(order.quantity.toString()) || 0, // Ensure number type
          schedule_arrival: order.scheduleArrival,
          notes: order.notes,
          
          // Cross dock fields - both formats
          crossDock: SHOW_CROSS_DOCK ? (order.crossDock === "Yes" ? "Yes" : "No") : "No" as "Yes" | "No",
          crossDockDestination: SHOW_CROSS_DOCK ? order.crossDockDestination : "",
          // Database column names
          cross_dock_type: SHOW_CROSS_DOCK ? (order.crossDock === "Yes" ? "Yes" : "No") : "No" as "Yes" | "No",
          cross_dock_destination: SHOW_CROSS_DOCK ? order.crossDockDestination : "",
          
          // Additional fields
          email: storeManagerEmail, // Set email to the store manager's email
          plant: plant, // Use plant determined from store
          timestamp: new Date().toISOString(),
          type: "TRANSFER",
          status: "open", // Default status
          userId: user ? user.username || "anonymous" : "anonymous",
          userEmail: user ? user.store || "anonymous" : "anonymous",
        };
      });

      // Submit each order to Supabase
      for (const order of formattedOrders) {
        await saveOrderToSupabase(order);
      }

      toast({
        title: "Orders Submitted Successfully",
        description: `${selectedOrders.length} order(s) have been submitted.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting orders:", error);
      toast({
        title: "Error Submitting Orders",
        description:
          "There was an error submitting your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitOrders,
  };
}
