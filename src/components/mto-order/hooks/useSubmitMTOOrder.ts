
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { getPlantForStore } from "@/utils/plantMapping";
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
      const managerEmail = getManagerEmail(formData.store);
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
        status: "pending", // FIXED: Changed from "open" to "pending" to match Supabase constraint
        description: `MTO - ${formData.tireTreadNeeded} - ${tireSize}`,
      };

      console.log("🔍 MTO FORM - Submission data:", mtoOrderData);

      // Submit to Supabase (uses mapMTOToSupabase internally for snake_case)
      await saveOrderToSupabase(mtoOrderData, user);
      console.log("🔍 MTO FORM - Saved to Supabase successfully");

      // Submit to Google Sheets (uses mapMTOToGoogleSheets internally for camelCase)
      const result = await submitToGoogleSheets(mtoOrderData, user);
      console.log("🔍 MTO FORM - Google Sheets result:", result);

      if (result.status === 'success' || result.status === 'partial_success') {
        toast({
          title: "MTO Order Submitted",
          description: "Your MTO order has been submitted successfully.",
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
