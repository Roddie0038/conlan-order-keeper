
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { getFirstManagerEmail } from "@/utils/emailUtils";
import { sendMTOOrderConfirmation } from "@/services/NotificationController";
import type { MTOFormData } from "@/types/orders";
import { normalizeStoreForSubmission, normalizeOrderStoreFields, extractStoreNumber } from "@/utils/storeNormalization";
import { mapMTOToSupabase } from "@/utils/mapMTOToSupabase";
import { supabase } from "@/integrations/supabase/client";

export const useSubmitMTOOrder = ({ formData, setIsSubmitting, resetForm, toast, errors, setErrors }: any) => {
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.store) newErrors.store = "Store is required";
    if (formData.store === "Unassigned" && !formData.assignedStore) {
      newErrors.assignedStore = "Assigned Store is required when ordering as Unassigned";
    }
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
      console.log("🔍 MTO FORM - Looking up manager email for store:", normalizedStore, "type: mto");
      const managerEmail = await getFirstManagerEmail(normalizedStore);
      console.log("🔍 MTO FORM - Manager email lookup result:", managerEmail);
      
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
      
      const mtoOrderRecord = mapMTOToSupabase(formDataWithPlant, user, formData.destinationPlant);
      
      // Log store format transformation for debugging
      console.log("🔄 STORE FORMAT TRANSFORMATION:", {
        original: formData.store,
        sanitized: mtoOrderRecord.store,
        plant: mtoOrderRecord.plant,
        normalizedStore: normalizedStore
      });

      console.log("🔍 MTO FORM - Final submission data:", {
        plant: mtoOrderRecord.plant,
        store: mtoOrderRecord.store
      });

      // Enhanced logging before Supabase insert
      console.log("🔍 MTO FORM - About to save to Supabase:", {
        user: user ? { id: user.id, email: user.email } : 'No user',
        payloadKeys: Object.keys(mtoOrderRecord),
        payload: mtoOrderRecord
      });

      // Session guard + fallback mechanism
      let savedOrder;
      
      try {
        // Primary path: Direct Supabase insert
        console.log("🔍 MTO FORM - Attempting direct Supabase insert");
        savedOrder = await saveOrderToSupabase(mtoOrderRecord, user);
        
        console.log("🔍 MTO FORM - Direct insert response:", {
          hasData: !!savedOrder.data,
          hasError: !!savedOrder.error,
          error: savedOrder.error?.message
        });
        
        // Check for auth/session errors requiring fallback
        if (savedOrder.error && (
          savedOrder.error.message.includes('Invalid Refresh Token') ||
          savedOrder.error.message.includes('JWT') ||
          savedOrder.error.message.includes('401') ||
          savedOrder.error.message.includes('403')
        )) {
          console.log("🔄 MTO FORM - Auth error detected, trying fallback");
          throw new Error('Session invalid, using fallback');
        }
        
        // Enhanced error checking - catch silent failures
        if (savedOrder.error || !savedOrder.data) {
          const errorMsg = savedOrder.error?.message || "Silent failure - no data returned from Supabase";
          console.error("❌ MTO FORM - Direct insert failed:", errorMsg);
          throw new Error(`Failed to submit MTO order to database: ${errorMsg}`);
        }
        
      } catch (directInsertError) {
        console.log("🔄 MTO FORM - Direct insert failed, trying fallback via edge function");
        
        // Fallback path: Use receive-mto-order edge function with service role
        try {
          const fallbackPayload = {
            ...mtoOrderRecord,
            // Add idempotency key to prevent duplication
            idempotency_key: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          
          const { data: fallbackData, error: fallbackError } = await supabase.functions.invoke(
            'receive-mto-order',
            { body: fallbackPayload }
          );
          
          if (fallbackError || !fallbackData?.order_id) {
            console.error("❌ MTO FORM - Fallback also failed:", fallbackError);
            throw new Error(`Both direct and fallback inserts failed: ${fallbackError?.message || 'Unknown error'}`);
          }
          
          console.log("✅ MTO FORM - Fallback successful:", fallbackData);
          savedOrder = { data: { id: fallbackData.order_id }, error: null };
          
        } catch (fallbackError) {
          console.error("❌ MTO FORM - Fallback failed:", fallbackError);
          throw new Error(`Failed to submit MTO order: ${fallbackError.message}`);
        }
      }
      
      console.log("✅ MTO FORM - Successfully saved to Supabase:", {
        id: savedOrder.data.id,
        plant: mtoOrderRecord.plant,
        store: mtoOrderRecord.store
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

        const confirmationResult = await sendMTOOrderConfirmation(
          {
            store: normalizedStore,
            plant: formData.destinationPlant,
            email: managerEmail,
            name: formData.name
          },
          savedOrder.data?.id?.toString() || 'Unknown',
          {
            quantity: parseInt(formData.quantity) || 0,
            product_number: formData.productNumber,
            description: `MTO - ${formData.tireTreadNeeded} - ${tireSize}`
          }
        );
        
        if (confirmationResult.success) {
          console.log(`✅ MTO FORM - Order confirmation email sent for plant ${mtoOrderRecord.plant}`);
        }
      } catch (emailError) {
        console.error("❌ MTO FORM - Error sending order confirmation email:", emailError);
      }

      // Send MTO notification to OT Platform (non-blocking)
      try {
        console.log("🔍 MTO FORM - Preparing notification with store format:", mtoOrderRecord.store);
        
        const mtoNotificationData = {
          id: savedOrder.data?.id?.toString() || 'Unknown',
          store: mtoOrderRecord.store, // Now uses display format (Grand Prairie 027)
          plant: mtoOrderRecord.plant
        };

        console.log("🔍 MTO FORM - Sending notification with data:", mtoNotificationData);
        // MTO notification is now handled by the NotificationController above
        console.log('✅ MTO FORM - MTO notification handled by NotificationController');
      } catch (notificationError) {
        console.error("❌ MTO FORM - Error sending MTO notification:", notificationError);
        // Don't throw - notification failures shouldn't block order submission
      }

      // Submit to Google Sheets (✅ KEEP: Google Sheets submission)
      const result = await submitToGoogleSheets(mtoOrderRecord, user);
      console.log("🔍 MTO FORM - Google Sheets result:", result);

      // 📊 DIAGNOSTIC: Enhanced result checking and user feedback
      console.log("🔍 MTO FORM - FULL DIAGNOSTIC SUMMARY:");
      console.log("  ✅ Supabase insert:", savedOrder.data ? "SUCCESS" : "FAILED");
      console.log("  📧 Email notification:", "ATTEMPTED (check logs above)");
      console.log("  📊 Google Sheets:", result.status);
      console.log("  🎯 Order ID:", savedOrder.data?.id);
      console.log("  🏪 Store format:", mtoOrderRecord.store);
      console.log("  🏭 Plant:", mtoOrderRecord.plant);

      if (result.status === 'success' || result.status === 'partial_success') {
        toast({
          title: "🎉 MTO order submitted successfully!",
          description: `Order #${savedOrder.data?.id} submitted to ${formData.destinationPlant}. ✅ Supabase: ${savedOrder.data ? 'SUCCESS' : 'FAILED'} | 📊 Google Sheets: ${result.status}`,
        });
        resetForm();
      } else {
        throw new Error(`Failed to submit MTO order. Supabase: ${savedOrder.data ? 'OK' : 'FAILED'}, Google Sheets: ${result.status}`);
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
