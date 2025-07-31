/**
 * Phase 2: Updated Order Form Submit Hook
 * Now uses unified order submission service with standardized payload handling
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OrderFormValues } from "../components/order-form/order-form-schema";
import type { OrderSummary } from "./useOrderSubmission";
import { submitOrder } from "@/services/unifiedOrderService";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";
import { sendOrderConfirmationEmail } from "@/services/orderingEmailService";
import type { OrderFormData } from "@/types/orders";
import { normalizeStoreFormatSync } from "@/utils/supabaseNormalization";
import { OrderType } from "@/services/OrderIDService";

export function useOrderFormSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
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
      for (const order of selectedOrders) {
        // Validate that plant is selected
        if (!order.destinationPlant) {
          toast({
            title: "Missing Plant Selection",
            description: "Please select a destination plant for all orders.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        console.log("✅ PHASE 2 - Processing order for plant:", order.destinationPlant);

        // Determine order type based on order properties
        let orderType: OrderType = "TRANSFER";
        
        if ('qtyWheels' in order && order.qtyWheels) {
          orderType = "WHEEL_POWDER_COATING";
        } else if (order.type === 'MTO' || ('casingGrade' in order && order.casingGrade)) {
          orderType = "MTO";
        }
        
        // ✅ PHASE 2: Create standardized order data using unified interfaces
        const standardizedOrderData: OrderFormData = {
          name: order.yourName,
          store: order.store,
          productNumber: order.productNumber,
          description: order.description,
          quantity: parseInt(order.quantity.toString()) || 0,
          scheduleArrival: order.scheduleArrival,
          notes: order.notes,
          crossDock: SHOW_CROSS_DOCK ? (order.crossDock === "Yes" ? "Yes" : "No") : "No" as "Yes" | "No",
          crossDockDestination: SHOW_CROSS_DOCK ? order.crossDockDestination || "" : "",
          email: user?.email || "",
          plant: order.destinationPlant, // ✅ Use selected plant directly
          timestamp: new Date().toISOString(),
          type: orderType
        };

        console.log("🔍 PHASE 2 - Standardized order data:", {
          plant: standardizedOrderData.plant,
          store: standardizedOrderData.store,
          type: orderType
        });

        // ✅ PHASE 2: Submit using unified service with proper normalization
        const submissionResult = await submitOrder(standardizedOrderData, orderType, user);
        
        if (!submissionResult.success || submissionResult.error) {
          throw new Error(`Failed to save order: ${submissionResult.error?.message}`);
        }

        console.log("✅ PHASE 2 - Order saved successfully:", {
          id: submissionResult.data?.id,
          plant: standardizedOrderData.plant,
          store: standardizedOrderData.store
        });

        // Send Order Confirmation Email (unchanged functionality)
        try {
          const normalizedStore = normalizeStoreFormatSync(order.store);
          const storeNumber = normalizedStore.match(/\d+/)?.[0] || '';
          
          const orderConfirmationData = {
            store_number: storeNumber,
            store_name: order.store,
            order_type: orderType,
            order_id: submissionResult.data?.id?.toString() || 'Unknown',
            timestamp: new Date().toISOString(),
            name: order.yourName || 'Unknown',
            email: user?.email || 'unknown@email.com',
            quantity: parseInt(order.quantity.toString()) || 0,
            product_number: order.productNumber,
            description: order.description
          };

          const confirmationResult = await sendOrderConfirmationEmail(orderConfirmationData);
          
          if (confirmationResult.success) {
            console.log(`✅ PHASE 2 - Confirmation email sent for order to ${standardizedOrderData.plant}`);
          }
        } catch (emailError) {
          console.error("❌ PHASE 2 - Error sending confirmation email:", emailError);
        }
      }

      toast({
        title: "Orders Submitted Successfully",
        description: `${selectedOrders.length} order(s) have been submitted to the selected plants.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("❌ PHASE 2 - Error submitting orders:", error);
      toast({
        title: "Error Submitting Orders",
        description: "There was an error submitting your orders. Please try again.",
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
