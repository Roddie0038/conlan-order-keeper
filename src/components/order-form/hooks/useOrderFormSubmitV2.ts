/**
 * Phase 2: Updated Component Order Form Submit Hook
 * Now uses unified order submission service with standardized payload handling
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/hooks/use-toast";
import { OrderFormValues } from "../order-form-schema";
import { OrderSummary } from "../types";
import { submitOrder } from "@/services/unifiedOrderService";
import { submitToGoogleSheets } from "@/services/sheets";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";
import { sendOrderConfirmationEmail } from "@/services/orderingEmailService";
import type { OrderFormData, MTOFormData } from "@/types/orders";
import { normalizeStoreFormatSync } from "@/utils/supabaseNormalization";
import { OrderType } from "@/services/OrderIDService";

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
      // Process each order with proper type detection and unified submission
      for (const order of selectedOrders) {
        
        console.log("🔍 PHASE 2 COMPONENT - Processing order:", order);
        
        // Determine order type based on order properties
        let orderType: OrderType = "TRANSFER"; // Default to TRANSFER
        
        // Check if it's a wheel order
        if ('qtyWheels' in order && order.qtyWheels) {
          orderType = "WHEEL_POWDER_COATING";
        }
        // Check if it's explicitly marked as MTO
        else if (order.type === 'MTO' || ('casingGrade' in order && order.casingGrade)) {
          orderType = "MTO";
        }
        
        console.log("🔍 PHASE 2 COMPONENT - Determined order type:", orderType);
        
        // ✅ PHASE 2: Create standardized order data based on order type
        let standardizedOrderData: OrderFormData | MTOFormData;
        
        if (orderType === 'MTO') {
          // Create MTO-specific data structure
          standardizedOrderData = {
            name: order.yourName,
            store: order.store,
            productNumber: order.productNumber,
            casingGrade: (order as any).casingGrade || "",
            tireSize: (order as any).tireSize || "",
            tread: (order as any).tread || (order as any).tireTreadNeeded || "",
            quantity: parseInt(order.quantity.toString()) || 0,
            notes: order.notes,
            email: user?.email || "",
            plant: selectedPlant || "",
            status: "pending",
            type: orderType,
            orderType: "MTO",
            description: order.description,
            timestamp: new Date().toISOString()
          } as MTOFormData;
        } else {
          // Create standard transfer order data structure
          standardizedOrderData = {
            name: order.yourName,
            store: order.store,
            productNumber: order.productNumber,
            description: order.description,
            quantity: parseInt(order.quantity.toString()) || 0,
            scheduleArrival: order.scheduleArrival,
            notes: order.notes,
            crossDock: SHOW_CROSS_DOCK ? (order.crossDock === "Yes" ? "Yes" : "No") : "No" as "Yes" | "No",
            crossDockDestination: SHOW_CROSS_DOCK ? order.crossDockDestination : "",
            email: user?.email || "",
            plant: selectedPlant || "",
            timestamp: new Date().toISOString(),
            type: orderType
          } as OrderFormData;
        }

        console.log("🔍 PHASE 2 COMPONENT - Standardized data:", {
          type: orderType,
          plant: standardizedOrderData.plant,
          store: standardizedOrderData.store
        });

        // ✅ PHASE 2: Submit using unified service with proper normalization
        const submissionResult = await submitOrder(standardizedOrderData, orderType, user);
        
        if (!submissionResult.success || submissionResult.error) {
          throw new Error(`Failed to save order: ${submissionResult.error?.message}`);
        }

        console.log("✅ PHASE 2 COMPONENT - Order saved successfully:", {
          id: submissionResult.data?.id,
          type: orderType
        });
        
        // ✅ Keep existing Google Sheets submission for backward compatibility
        await submitToGoogleSheets(standardizedOrderData, user);

        // Send Order Confirmation Email (unchanged functionality)
        const normalizedStore = normalizeStoreFormatSync(order.store);
        const storeNumber = normalizedStore.match(/\d+/)?.[0] || '';
        
        if (storeNumber && submissionResult.data?.id) {
          try {
            console.log("📧 PHASE 2 COMPONENT - Sending confirmation email for store:", storeNumber);
            
            const emailResult = await sendOrderConfirmationEmail({
              store_number: storeNumber,
              store_name: order.store,
              order_type: orderType,
              order_id: submissionResult.data.id.toString(),
              timestamp: standardizedOrderData.timestamp!,
              name: standardizedOrderData.name,
              email: standardizedOrderData.email!,
              quantity: standardizedOrderData.quantity,
              product_number: standardizedOrderData.productNumber,
              description: standardizedOrderData.description || ""
            });
            
            if (emailResult.success) {
              console.log("✅ PHASE 2 COMPONENT - Confirmation email sent successfully");
            } else {
              console.warn("⚠️ PHASE 2 COMPONENT - Confirmation email failed:", emailResult.message);
            }
          } catch (emailError) {
            console.error("❌ PHASE 2 COMPONENT - Error sending confirmation email:", emailError);
            // Don't block order submission for email failures
          }
        } else {
          console.warn("⚠️ PHASE 2 COMPONENT - Skipping confirmation email - missing store number or order ID");
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
      console.error("❌ PHASE 2 COMPONENT - Error submitting orders:", error);
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
