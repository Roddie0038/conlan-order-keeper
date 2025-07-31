
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OrderFormValues } from "../components/order-form/order-form-schema";
import type { OrderSummary } from "./useOrderSubmission";
import { saveOrderToSupabase } from "@/services/orderService";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";
import { sendOrderConfirmationEmail } from "@/services/orderingEmailService";
import type { OrderFormData } from "@/types/orders";
import { normalizeStoreForSubmission, normalizeOrderStoreFields, extractStoreNumber } from "@/utils/storeNormalization";

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

        console.log("✅ Processing order for plant:", order.destinationPlant);

        const normalizedStore = normalizeStoreForSubmission(order.store);
        const storeNumber = extractStoreNumber(normalizedStore);
        
        console.log("📧 ORDER SUBMIT - Using selected plant:", order.destinationPlant);
        
        // Determine order type based on order properties
        let orderType: any = "TRANSFER";
        
        if ('qtyWheels' in order && order.qtyWheels) {
          orderType = "WHEEL_POWDER_COATING";
        } else if (order.type === 'MTO' || ('casingGrade' in order && order.casingGrade)) {
          orderType = "MTO";
        }
        
        // Create order data using the selected plant directly
        const baseOrder: OrderFormData = {
          name: order.yourName,
          store: normalizedStore,
          productNumber: order.productNumber,
          description: order.description,
          quantity: parseInt(order.quantity.toString()) || 0,
          scheduleArrival: order.scheduleArrival,
          notes: order.notes,
          crossDock: SHOW_CROSS_DOCK ? (order.crossDock === "Yes" ? "Yes" : "No") : "No" as "Yes" | "No",
          crossDockDestination: SHOW_CROSS_DOCK ? normalizeStoreForSubmission(order.crossDockDestination || "") : "",
          email: user?.email || "",
          plant: order.destinationPlant, // ✅ Use selected plant directly
          timestamp: new Date().toISOString(),
          type: orderType
        };
        
        const formattedOrder = normalizeOrderStoreFields(baseOrder);

        console.log("🔍 ORDER SUBMIT - Final order data:", {
          plant: formattedOrder.plant,
          store: formattedOrder.store,
          type: orderType
        });

        // Submit to Supabase
        const savedOrder = await saveOrderToSupabase(formattedOrder);
        
        if (savedOrder.error) {
          throw new Error(`Failed to save order: ${savedOrder.error.message}`);
        }

        console.log("✅ ORDER SUBMIT - Order saved with plant:", formattedOrder.plant);

        // Send Order Confirmation Email
        try {
          const orderConfirmationData = {
            store_number: storeNumber,
            store_name: order.store,
            order_type: orderType,
            order_id: savedOrder.data?.id?.toString() || 'Unknown',
            timestamp: new Date().toISOString(),
            name: order.yourName || 'Unknown',
            email: user?.email || 'unknown@email.com',
            quantity: parseInt(order.quantity.toString()) || 0,
            product_number: order.productNumber,
            description: order.description
          };

          const confirmationResult = await sendOrderConfirmationEmail(orderConfirmationData);
          
          if (confirmationResult.success) {
            console.log(`✅ ORDER SUBMIT - Confirmation email sent for order to ${formattedOrder.plant}`);
          }
        } catch (emailError) {
          console.error("❌ ORDER SUBMIT - Error sending confirmation email:", emailError);
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
      console.error("❌ ORDER SUBMIT - Error submitting orders:", error);
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
