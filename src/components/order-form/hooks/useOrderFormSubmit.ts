
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
import { sendOrderConfirmationEmail } from "@/services/orderingEmailService";
import type { OrderFormData } from "@/types/orders";

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
      // Process each order with proper type detection and dual mapping strategy
      for (const order of selectedOrders) {
        // PHASE 1: Fix Store Number Extraction
        // Extract store number whether it's "22" or "Fort Worth 22" format
        let storeNumber = "";
        if (/^\d+$/.test(order.store)) {
          // Pure number like "22"
          storeNumber = order.store;
        } else {
          // Store name with number like "Fort Worth 22"
          const match = order.store.match(/\d+$/);
          storeNumber = match ? match[0] : "";
        }
        
        console.log("📧 STORE EMAIL DEBUG - Original store:", order.store, "→ Extracted store number:", storeNumber);
        
        // REMOVED: No longer using hardcoded storeData lookup
        // Now using dynamic platform_users lookup in the edge function
        
        // Determine the plant based on the store
        const plant = getPlantForStore(order.store);
        
        // CRITICAL FIX: Determine order type based on order properties
        let orderType = "TRANSFER"; // Default to TRANSFER
        
        // Check if it's a wheel order
        if ('qtyWheels' in order && order.qtyWheels) {
          orderType = "WHEEL_POWDER_COATING" as const;
        }
        // Check if it's explicitly marked as MTO
        else if (order.type === 'MTO' || ('casingGrade' in order && order.casingGrade)) {
          orderType = "MTO" as const;
        }
        
        console.log("🔍 ORDER FORM SUBMIT - Determined order type:", orderType, "for order:", order);
        
        // Create the order data in camelCase (internal format) with correct type
        const orderRecord: OrderFormData = {
          name: order.yourName,
          store: order.store,
          productNumber: order.productNumber,
          description: order.description,
          quantity: parseInt(order.quantity.toString()) || 0,
          scheduleArrival: order.scheduleArrival,
          notes: order.notes,
          crossDock: SHOW_CROSS_DOCK ? (order.crossDock === "Yes" ? "Yes" : "No") : "No" as "Yes" | "No",
          crossDockDestination: SHOW_CROSS_DOCK ? order.crossDockDestination : "",
          email: user?.email || "", // Use the submitting user's email
          plant: plant,
          timestamp: new Date().toISOString(),
          type: orderType as any // Use the determined order type for correct routing
        };

        console.log("🔍 ORDER FORM SUBMIT - Submitting with type:", orderType);

        // Submit to Supabase (uses mapOrderToSupabase internally for snake_case)
        const savedOrderResult = await saveOrderToSupabase(orderRecord, user);
        
        // Submit to Google Sheets (uses mapOrderToGoogleSheets internally for camelCase)
        await submitToGoogleSheets(orderRecord, user);

        // PHASE 4: Send Order Confirmation Email to Store Recipients
        if (storeNumber && savedOrderResult?.data?.id) {
          try {
            console.log("📧 STORE EMAIL DEBUG - Calling sendOrderConfirmationEmail for store:", storeNumber);
            
            const emailResult = await sendOrderConfirmationEmail({
              store_number: storeNumber,
              store_name: order.store,
              order_type: orderType,
              order_id: savedOrderResult.data.id.toString(),
              timestamp: orderRecord.timestamp,
              name: orderRecord.name,
              email: orderRecord.email,
              quantity: orderRecord.quantity,
              product_number: orderRecord.productNumber,
              description: orderRecord.description
            });
            
            console.log("📧 STORE EMAIL DEBUG - sendOrderConfirmationEmail result:", emailResult);
            
            if (emailResult.success) {
              console.log("✅ Store confirmation email sent successfully:", emailResult.message);
            } else {
              console.warn("⚠️ Store confirmation email failed:", emailResult.message);
            }
          } catch (emailError) {
            console.error("❌ Error sending store confirmation email:", emailError);
            // Don't block order submission for email failures
          }
        } else {
          console.warn("⚠️ Skipping store confirmation email - missing store number or order ID");
        }
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
