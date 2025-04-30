import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/hooks/use-toast";
import { OrderFormValues } from "../order-form-schema";
import { OrderSummary } from "../types";
import { submitOrder } from "@/services/orderService";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";

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
      const formattedOrders = selectedOrders.map((order) => ({
        yourName: order.yourName,
        store: order.store,
        dateReceived: order.dateReceived,
        productNumber: order.productNumber,
        description: order.description,
        quantity: order.quantity,
        scheduleArrival: order.scheduleArrival,
        notes: order.notes,
        crossDock: SHOW_CROSS_DOCK ? order.crossDock : "no",
        crossDockDestination: SHOW_CROSS_DOCK ? order.crossDockDestination : "",
        managersEmail: order.managersEmail || "",
        plant: selectedPlant,
        timestamp: new Date().toISOString(),
        userId: user?.id || "anonymous",
        userEmail: user?.email || "anonymous",
      }));

      // Submit the orders
      await submitOrder(formattedOrders);

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
