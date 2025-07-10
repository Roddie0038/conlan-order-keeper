
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
import { getPlantForStore } from "@/utils/plantMapping";
import { getStoreEmailRecipients } from "@/services/emailRouting";
import { sendOrderConfirmationEmail } from "@/services/orderingEmailService";
import type { MTOOrderData } from "@/types/supabase-extensions";

export const useSubmitMTOOrder = ({ formData, setIsSubmitting, resetForm, toast }: any) => {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.store || !formData.name || !formData.productNumber || 
        !formData.tireSize || !formData.tireTreadNeeded || !formData.quantity || 
        formData.casingGrade.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🔍 MTO FORM - Starting MTO submission");
      
      // Get manager email and plant
      const managerEmail = await getFirstManagerEmail(formData.store);
      const plant = getPlantForStore(formData.store);
      const tireSize = formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize;
      const timestamp = new Date().toISOString();
      
      console.log("🔍 MTO FORM - Manager email:", managerEmail);
      console.log("🔍 MTO FORM - Plant:", plant);

      // Create order data in camelCase (internal format)
      const mtoOrderData: MTOOrderData = {
        name: formData.name,
        store: formData.store,
        productNumber: formData.productNumber,
        casingGrade: formData.casingGrade.join(", "),
        tireSize: tireSize,
        tread: formData.tireTreadNeeded,
        tireTreadNeeded: formData.tireTreadNeeded,
        quantity: parseInt(formData.quantity) || 0,
        notes: formData.notes || "",
        email: managerEmail,
        managerEmail: managerEmail,
        plant: plant,
        timestamp: timestamp,
        type: "MTO",
        orderType: "MTO",
        status: "open", 
        description: `MTO - ${formData.tireTreadNeeded} - ${tireSize}`,
      };

      console.log("🔍 MTO FORM - Submission data:", mtoOrderData);

      // Submit to Supabase (uses mapMTOToSupabase internally for snake_case)
      const savedOrder = await saveOrderToSupabase(mtoOrderData, user);
      
      if (savedOrder.error) {
        throw new Error("Failed to submit MTO order to database");
      }
      
      console.log("🔍 MTO FORM - Saved to Supabase successfully:", savedOrder.data);

      // Send order confirmation email
      try {
        console.log("📧 MTO FORM - Sending order confirmation email...");
        
        const storeNumber = formData.store.match(/\d+$/)?.[0] || "";
        const orderConfirmationData = {
          store_number: storeNumber,
          store_name: formData.store,
          order_type: 'MTO',
          order_id: savedOrder.data?.id?.toString() || 'Unknown',
          timestamp: timestamp,
          name: formData.name,
          email: managerEmail,
          quantity: parseInt(formData.quantity) || 0,
          product_number: formData.productNumber,
          description: `MTO - ${formData.tireTreadNeeded} - ${tireSize}`
        };

        const confirmationResult = await sendOrderConfirmationEmail(orderConfirmationData);
        
        if (confirmationResult.success) {
          console.log(`✅ MTO FORM - Order confirmation email sent for order ${savedOrder.data?.id}`);
        }
      } catch (emailError) {
        console.error("❌ MTO FORM - Error sending order confirmation email:", emailError);
      }

      // Submit to Google Sheets (uses mapMTOToGoogleSheets internally for camelCase)
      const result = await submitToGoogleSheets(mtoOrderData, user);
      console.log("🔍 MTO FORM - Google Sheets result:", result);

      // Send workflow notification emails using centralized database routing
      const storeNumberForNotification = formData.store.match(/\d+$/)?.[0] || "";
      if (storeNumberForNotification) {
        try {
          const emailResult = await getStoreEmailRecipients(storeNumberForNotification, 'mto');
          const emailRecipients = emailResult.recipients;
          
          console.log(`🔍 MTO FORM - Email recipients (${emailResult.source}):`, emailRecipients);
          if (emailResult.source === 'fallback') {
            console.warn(`🔍 MTO FORM - Using fallback routing: ${emailResult.fallbackReason}`);
          }
          
          if (emailRecipients.length > 0) {
            try {
            const emailResponse = await fetch(
              `https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/mto-notification`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
                },
                body: JSON.stringify({
                  mtoData: mtoOrderData,
                  orderId: savedOrder.data?.id || 'unknown',
                  recipients: emailRecipients
                })
              }
            );
            
            if (emailResponse.ok) {
              console.log("✅ MTO FORM - Email notification sent successfully");
            } else {
              console.error("❌ MTO FORM - Email notification failed");
            }
            } catch (emailError) {
              console.error("❌ MTO FORM - Error sending email notification:", emailError);
            }
          }
        } catch (emailRoutingError) {
          console.error("❌ MTO FORM - Error getting email recipients:", emailRoutingError);
        }
      }

      if (result.status === 'success' || result.status === 'partial_success') {
        toast({
          title: "🎉 MTO order submitted successfully! 🎉",
          description: "Your MTO order has been submitted and is being processed with excitement!",
        });
        resetForm();
      } else {
        throw new Error("Failed to submit MTO order");
      }
    } catch (error) {
      console.error("❌ MTO FORM - Error submitting MTO order:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your MTO order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return handleSubmit;
};
