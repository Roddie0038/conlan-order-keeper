
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
import { getStoreEmailRecipients } from "@/services/emailRouting";
import { sendOrderConfirmationEmail } from "@/services/orderingEmailService";
import { supabase } from "@/integrations/supabase/client";
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
      // Process each order individually to handle emails properly
      for (const order of selectedOrders) {
        // Find the store manager email from storeData
        const storeNumber = order.store.match(/\d+$/)?.[0] || "";
        const matchedStore = storeData.find(s => s.storeNumber === storeNumber);
        const storeManagerEmail = matchedStore?.managerEmails || "";
        
        // Determine the plant based on the store
        const plant = getPlantForStore(order.store);
        
        // Determine order type based on order properties
        let orderType = "TRANSFER"; // Default to TRANSFER
        
        // Check if it's a wheel order
        if ('qtyWheels' in order && order.qtyWheels) {
          orderType = "WHEEL_POWDER_COATING";
        }
        // Check if it's explicitly marked as MTO
        else if (order.type === 'MTO' || ('casingGrade' in order && order.casingGrade)) {
          orderType = "MTO";
        }
        
        console.log("🔍 ORDER SUBMIT - Determined order type:", orderType, "for order:", order);
        
        // Format the order for submission - Using camelCase field names
        const formattedOrder: OrderData = {
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
          type: orderType // Use the determined order type
        };

        console.log("🔍 ORDER SUBMIT - Submitting order:", formattedOrder);

        // Submit to Supabase
        const savedOrder = await saveOrderToSupabase(formattedOrder);
        
        if (savedOrder.error) {
          throw new Error(`Failed to save order: ${savedOrder.error.message}`);
        }

        console.log("✅ ORDER SUBMIT - Order saved to Supabase:", savedOrder.data);

        // 🔹 Send Order Confirmation Email (New Ordering Platform System)
        try {
          console.log("📧 ORDER SUBMIT - Sending order confirmation email via ordering system...");
          
          const orderConfirmationData = {
            store_number: storeNumber,
            store_name: order.store,
            order_type: orderType,
            order_id: savedOrder.data?.id?.toString() || 'Unknown',
            timestamp: new Date().toISOString(),
            name: order.yourName || 'Unknown',
            email: storeManagerEmail || 'unknown@email.com',
            quantity: parseInt(order.quantity.toString()) || 0,
            product_number: order.productNumber,
            description: order.description
          };

          const confirmationResult = await sendOrderConfirmationEmail(orderConfirmationData);
          
          if (confirmationResult.success) {
            console.log(`✅ ORDER SUBMIT - Order confirmation email sent for order ${savedOrder.data?.id}`);
          } else {
            console.error(`❌ ORDER SUBMIT - Order confirmation email failed:`, confirmationResult.message);
          }
        } catch (emailError) {
          console.error("❌ ORDER SUBMIT - Error sending order confirmation email:", emailError);
          // Log the error but don't block the order submission
        }

        // Send notification email for workflow triggers (existing system)
        if (storeNumber) {
          try {
            console.log("📧 ORDER SUBMIT - Sending confirmation email for store:", storeNumber);
            
            // Determine email type based on order type
            let emailType: 'transfer' | 'mto' | 'wheel' = 'transfer';
            if (orderType === 'MTO') {
              emailType = 'mto';
            } else if (orderType === 'WHEEL_POWDER_COATING') {
              emailType = 'wheel';
            }
            
            // Get email recipients from centralized database system
            const emailResult = await getStoreEmailRecipients(storeNumber, emailType);
            const emailRecipients = emailResult.recipients;
            
            console.log(`📧 ORDER SUBMIT - Email recipients (${emailResult.source}):`, emailRecipients);
            if (emailResult.source === 'fallback') {
              console.warn(`📧 ORDER SUBMIT - Using fallback routing: ${emailResult.fallbackReason}`);
            }
            
            if (emailRecipients.length > 0) {
              // Call the transfer-notification edge function (now using Resend)
              const emailResponse = await fetch(
                `https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/transfer-notification`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
                  },
                  body: JSON.stringify({
                    transferData: formattedOrder,
                    orderId: savedOrder.data?.id || 'unknown',
                    recipients: emailRecipients
                  })
                }
              );
              
              if (emailResponse.ok) {
                const emailResult = await emailResponse.json();
                console.log("✅ ORDER SUBMIT - Confirmation email sent successfully:", emailResult);
              } else {
                const emailError = await emailResponse.text();
                console.error("❌ ORDER SUBMIT - Email notification failed:", emailError);
                // Don't throw here - we don't want email failures to block order submission
              }
            } else {
              console.log("⚠️ ORDER SUBMIT - No email recipients found for store:", storeNumber);
            }
          } catch (emailError) {
            console.error("❌ ORDER SUBMIT - Error sending confirmation email:", emailError);
            // Log the error but don't block the order submission
          }
        }
      }

      toast({
        title: "Orders Submitted Successfully",
        description: `${selectedOrders.length} order(s) have been submitted and confirmation emails sent.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("❌ ORDER SUBMIT - Error submitting orders:", error);
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
