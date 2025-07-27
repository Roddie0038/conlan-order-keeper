
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
import { sendOrderConfirmationEmail } from "@/services/orderingEmailService";
import { sendMTONotificationEmail } from "@/services/mtoNotificationService";
import type { MTOOrderData } from "@/types/supabase-extensions";
import { normalizeStoreForSubmission, normalizeOrderStoreFields, extractStoreNumber } from "@/utils/storeNormalization";
import { mapMTOToSupabase } from "@/utils/mapMTOToSupabase";

export const useSubmitMTOOrder = ({ formData, setIsSubmitting, resetForm, toast, errors, setErrors }: any) => {
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.store) newErrors.store = "Store is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.productNumber || formData.productNumber.trim() === '') newErrors.productNumber = "Product number is required";
    if (!formData.tireSize) newErrors.tireSize = "Tire size is required";
    if (!formData.tireTreadNeeded) newErrors.tireTreadNeeded = "Tire tread needed is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    if (formData.casingGrade.length === 0) newErrors.casingGrade = "At least one casing grade must be selected";
    if (!formData.destinationPlant) newErrors.destinationPlant = "Please select a destination plant";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🔍 MTO FORM - Starting MTO submission with plant:", formData.destinationPlant);
      
      const normalizedStore = normalizeStoreForSubmission(formData.store);
      const managerEmail = await getFirstManagerEmail(normalizedStore, 'mto');
      
      const tireSize = formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize;
      const timestamp = new Date().toISOString();
      
      console.log("✅ MTO FORM - Using selected plant:", formData.destinationPlant);

      // Create order data using mapMTOToSupabase with proper store sanitization
      const formDataWithPlant = {
        ...formData,
        plant: formData.destinationPlant,
        email: managerEmail,
        managerEmail: managerEmail,
        tireSize: tireSize,
        tread: formData.tireTreadNeeded
      };
      
      const mtoOrderData = mapMTOToSupabase(formDataWithPlant, user, formData.destinationPlant);
      
      // Log store format transformation for debugging
      console.log("🔄 STORE FORMAT TRANSFORMATION:", {
        original: formData.store,
        sanitized: mtoOrderData.store,
        plant: mtoOrderData.plant,
        normalizedStore: normalizedStore
      });

      console.log("🔍 MTO FORM - Final submission data:", {
        plant: mtoOrderData.plant,
        store: mtoOrderData.store
      });

      // Enhanced logging before Supabase insert
      console.log("🔍 MTO FORM - About to save to Supabase:", {
        user: user ? { id: user.id, email: user.email } : 'No user',
        payloadKeys: Object.keys(mtoOrderData),
        payload: mtoOrderData
      });

      // Submit to Supabase with enhanced error handling
      const savedOrder = await saveOrderToSupabase(mtoOrderData, user);
      
      console.log("🔍 MTO FORM - Supabase response:", {
        hasData: !!savedOrder.data,
        hasError: !!savedOrder.error,
        data: savedOrder.data,
        error: savedOrder.error
      });
      
      // Enhanced error checking - catch silent failures
      if (savedOrder.error || !savedOrder.data) {
        const errorMsg = savedOrder.error?.message || "Silent failure - no data returned from Supabase";
        console.error("❌ MTO FORM - Supabase insert failed:", errorMsg);
        throw new Error(`Failed to submit MTO order to database: ${errorMsg}`);
      }
      
      console.log("✅ MTO FORM - Successfully saved to Supabase:", {
        id: savedOrder.data.id,
        plant: mtoOrderData.plant,
        store: mtoOrderData.store
      });

      // Send order confirmation email
      try {
        const storeNumber = extractStoreNumber(normalizedStore);
        const orderConfirmationData = {
          store_number: storeNumber,
          store_name: normalizedStore,
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
          console.log(`✅ MTO FORM - Order confirmation email sent for plant ${mtoOrderData.plant}`);
        }
      } catch (emailError) {
        console.error("❌ MTO FORM - Error sending order confirmation email:", emailError);
      }

      // Send MTO notification to OT Platform (non-blocking)
      try {
        console.log("🔍 MTO FORM - Preparing notification with store format:", mtoOrderData.store);
        
        const mtoNotificationData = {
          id: savedOrder.data?.id?.toString() || 'Unknown',
          store: mtoOrderData.store, // Now uses display format (Grand Prairie 027)
          plant: mtoOrderData.plant
        };

        console.log("🔍 MTO FORM - Sending notification with data:", mtoNotificationData);
        const notificationResult = await sendMTONotificationEmail(mtoNotificationData, "mto_casings_needed");
        
        if (notificationResult.success) {
          console.log(`✅ MTO FORM - MTO notification sent to OT Platform: ${notificationResult.message}`);
        } else {
          console.warn(`⚠️ MTO FORM - MTO notification failed: ${notificationResult.message}`);
        }
      } catch (notificationError) {
        console.error("❌ MTO FORM - Error sending MTO notification:", notificationError);
        // Don't throw - notification failures shouldn't block order submission
      }

      // Submit to Google Sheets
      const result = await submitToGoogleSheets(mtoOrderData, user);
      console.log("🔍 MTO FORM - Google Sheets result:", result);

      if (result.status === 'success' || result.status === 'partial_success') {
        toast({
          title: "🎉 MTO order submitted successfully! 🎉",
          description: `Your MTO order has been submitted to ${formData.destinationPlant}!`,
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
