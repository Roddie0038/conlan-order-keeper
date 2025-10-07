
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OrderSummary } from "../types";
import { getPlantForStore } from "@/utils/plantMapping";
import { submitOtOrder, type OtOrderPayload } from "@/lib/ingestOtOrder";
import { toast as sonnerToast } from "sonner";

export function useOrderFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmitOrders = async (
    selectedOrders: OrderSummary[],
    onSuccess?: () => void
  ) => {
    if (selectedOrders.length === 0) {
      sonnerToast.error("No Orders Selected", {
        description: "Please select at least one order to submit.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let successCount = 0;
      let failCount = 0;

      // Process each order
      for (const order of selectedOrders) {
        const plant = getPlantForStore(order.store);
        
        const payload: OtOrderPayload = {
          order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          product_number: order.productNumber,
          quantity: parseInt(order.quantity.toString()) || 0,
          store: order.store,
          plant: plant,
          submitted_by_email: user?.email || "",
          submitted_by_name: order.yourName,
        };

        const result = await submitOtOrder(payload);

        if (result.ok === true) {
          successCount++;
          console.log("✅ Order submitted successfully:", result.id);
        }
        
        if (result.ok === false) {
          failCount++;
          console.error("❌ Order submission failed:", result.status, result.message);
        }
      }

      if (successCount > 0) {
        sonnerToast.success("Orders Submitted", {
          description: `${successCount} order(s) submitted successfully${failCount > 0 ? `, ${failCount} failed` : ""}.`,
        });
      }

      if (failCount > 0 && successCount === 0) {
        sonnerToast.error("Submission Failed", {
          description: `Failed to submit ${failCount} order(s). Please try again.`,
        });
      }

      if (successCount > 0 && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting orders:", error);
      sonnerToast.error("Error Submitting Orders", {
        description: "There was an error submitting your orders. Please try again.",
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
