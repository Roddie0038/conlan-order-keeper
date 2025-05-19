import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/hooks/use-toast";
import { OrderFormValues } from "../components/order-form/order-form-schema";
import { OrderSummary } from "../components/order-form/types";
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
        
        // Determine the plant based on the store
        const plant = getPlantForStore(order.store);
        
        return {
          name: order.yourName,
          store: order.store,
          productNumber: order.productNumber,
          description: order.description,
          quantity: order.quantity,
          scheduleArrival: order.scheduleArrival,
          notes: order.notes,
          crossDock: SHOW_CROSS_DOCK ? (order.crossDock === "Yes" ? "Yes" : "No") : "No" as "Yes" | "No",
          crossDockDestination: SHOW_CROSS_DOCK ? order.crossDockDestination : "",
          email: storeManagerEmail,
          plant: plant,
          timestamp: new Date().toISOString(),
          type: "TRANSFER"
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
