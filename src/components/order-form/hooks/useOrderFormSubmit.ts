
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/hooks/use-toast";
import { OrderFormValues } from "../order-form-schema";
import { OrderSummary } from "../types";
import { saveOrderToSupabase } from "@/services/orderService";
import { submitToGoogleSheets } from "@/services/sheets";
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
      // Process each order with dual mapping strategy
      for (const order of selectedOrders) {
        // Find the store manager email from storeData
        const storeNumber = order.store.match(/\d+$/)?.[0] || "";
        const matchedStore = storeData.find(s => s.storeNumber === storeNumber);
        const storeManagerEmail = matchedStore?.managerEmails || "";
        
        // Determine the plant based on the store
        const plant = getPlantForStore(order.store);
        
        // Create the order data in camelCase (internal format)
        const orderData: OrderData = {
          name: order.yourName,
          store: order.store,
          productNumber: order.productNumber,
          description: order.description,
          quantity: parseInt(order.quantity.toString()) || 0,
          scheduleArrival: order.scheduleArrival,
          notes: order.notes,
          crossDock: SHOW_CROSS_DOCK ? (order.crossDock === "Yes" ? "Yes" : "No") : "No" as "Yes" | "No",
          crossDockDestination: SHOW_CROSS_DOCK ? order.crossDockDestination : "",
          email: storeManagerEmail,
          plant: plant,
          timestamp: new Date().toISOString(),
          type: "TRANSFER"
        };

        // Submit to Supabase (uses mapOrderToSupabase internally for snake_case)
        await saveOrderToSupabase(orderData, user);
        
        // Submit to Google Sheets (uses mapOrderToGoogleSheets internally for camelCase)
        await submitToGoogleSheets(orderData, user);
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
