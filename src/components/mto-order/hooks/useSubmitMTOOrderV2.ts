/**
 * Phase 2: Updated MTO Form Submission Hook
 * Now uses unified order submission service with standardized payload handling
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { submitMTOOrder } from "@/services/unifiedOrderService";
import { sendMTOOrderConfirmation } from "@/services/NotificationController";
import type { MTOFormData } from "@/types/orders";
import { normalizeStoreFormatSync } from "@/utils/supabaseNormalization";

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
      console.log("🔍 PHASE 2 MTO FORM - Starting submission with plant:", formData.destinationPlant);
      
      const tireSize = formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize;
      const timestamp = new Date().toISOString();
      
      // ✅ PHASE 2: Create standardized MTO data using unified interfaces
      const standardizedMTOData: MTOFormData = {
        name: formData.name,
        store: formData.store,
        productNumber: formData.productNumber,
        casingGrade: Array.isArray(formData.casingGrade) ? formData.casingGrade.join(', ') : formData.casingGrade,
        tireSize: tireSize,
        tread: formData.tireTreadNeeded,
        quantity: parseInt(formData.quantity) || 0,
        notes: formData.notes || "",
        email: user?.email || "",
        plant: formData.destinationPlant,
        status: "pending",
        type: "MTO",
        orderType: "MTO",
        description: `MTO - ${formData.tireTreadNeeded} - ${tireSize}`,
        timestamp: timestamp
      };

      console.log("🔍 PHASE 2 MTO FORM - Standardized data:", {
        plant: standardizedMTOData.plant,
        store: standardizedMTOData.store
      });

      // ✅ PHASE 2: Submit using unified service with proper normalization
      const submissionResult = await submitMTOOrder(standardizedMTOData, user);
      
      if (!submissionResult.success || submissionResult.error) {
        throw new Error(`Failed to submit MTO order: ${submissionResult.error?.message}`);
      }

      console.log("✅ PHASE 2 MTO FORM - Successfully saved to Supabase:", {
        id: submissionResult.data?.id,
        plant: standardizedMTOData.plant,
        store: standardizedMTOData.store
      });

      // ✅ PHASE 3: Send notification using new unified resolution system
      if (submissionResult.data?.id) {
        try {
          console.log("🛡️ PHASE 4 MTO FORM - Sending notification via hardened service");
          
          const { hardenedNotificationService } = await import("@/services/notificationHardeningService");
          
          const notificationResult = await hardenedNotificationService.sendHardenedNotification(
            standardizedMTOData,
            'mto',
            submissionResult.data.id.toString(),
            {
              product_number: standardizedMTOData.productNumber,
              description: standardizedMTOData.description || "",
              quantity: standardizedMTOData.quantity
            }
          );
          
          if (notificationResult.success) {
            console.log(`✅ PHASE 4 MTO FORM - Hardened notification succeeded: ${notificationResult.totalAttempts} attempts, ${notificationResult.recipients_count} recipients, status: ${notificationResult.finalStatus}`);
          } else {
            console.warn("⚠️ PHASE 4 MTO FORM - Hardened notification failed:", notificationResult.message, `Final status: ${notificationResult.finalStatus}`);
          }
        } catch (emailError) {
          console.error("❌ PHASE 4 MTO FORM - Error sending hardened notification:", emailError);
        }
      }

      // ✅ Keep existing Google Sheets submission for backward compatibility
      const result = await submitToGoogleSheets(standardizedMTOData, user);
      console.log("🔍 PHASE 2 MTO FORM - Google Sheets result:", result);

      if (result.status === 'success' || result.status === 'partial_success' || submissionResult.data) {
        toast({
          title: "🎉 MTO order submitted successfully!",
          description: `Order #${submissionResult.data?.id} submitted to ${formData.destinationPlant}. ✅ Supabase: SUCCESS | 📊 Google Sheets: ${result.status}`,
        });
        resetForm();
      } else {
        throw new Error(`Failed to submit MTO order. Supabase: ${submissionResult.data ? 'OK' : 'FAILED'}, Google Sheets: ${result.status}`);
      }
    } catch (error) {
      console.error("❌ PHASE 2 MTO FORM - Error submitting MTO order:", error);
      toast({
        title: "Error",
        description: `There was a problem submitting your MTO order: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return handleSubmit;
};
