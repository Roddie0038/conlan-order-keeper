
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/components/ui/use-toast";
import { submitOtOrder, type OtOrderPayload } from "@/services/submitOtOrder";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
import { getPlantForStore } from "@/utils/plantMapping";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/database";

export const useSubmitMTOOrder = ({ formData, setIsSubmitting, resetForm, toast }: any) => {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation: Only validate truly required fields for new schema
    if (!formData.store || !formData.name) {
      toast({
        title: "Validation Error",
        description: "Store and Name are required fields.",
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
      
      // Validate email format for submitted_by_email
      if (!managerEmail || !managerEmail.includes('@')) {
        toast({
          title: "Validation Error", 
          description: "A valid email is required.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Create order data for new schema - only include fields DB expects
      type MtoInsert = Database['public']['Tables']['mto_orders']['Insert'];
      
      const mtoOrderData: MtoInsert = {
        store: formData.store,
        plant: plant,
        submitted_by_email: managerEmail,
        submitted_by_name: formData.name,
        quantity: parseInt(formData.quantity) || 1,
        // Optional fields - only include if present
        ...(formData.productNumber && { product_number: formData.productNumber }),
        ...(tireSize && { tire_size: tireSize }),
        ...(formData.casingGrade.length > 0 && { casing_grade: formData.casingGrade.join(", ") }),
        ...(formData.tireTreadNeeded && { tread: formData.tireTreadNeeded }),
        ...(formData.notes && { notes: formData.notes })
      };

      console.log("🔍 MTO FORM - Submission data:", mtoOrderData);

      // Submit to Supabase directly with typed response
      const { data, error } = await supabase
        .from('mto_orders')
        .insert(mtoOrderData)
        .select('id, order_number, product_number, quantity, store, plant, created_at')
        .single();
      
      if (error) {
        console.error("❌ MTO FORM - Supabase error:", error);
        throw new Error(`Failed to submit MTO order: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('No data returned from MTO order insert');
      }
      
      console.log("✅ MTO FORM - Saved to Supabase successfully:", data);
      
      // Submit to OT function (NO Google Sheets, NO ordering DB writes, NO notification_logs)
      console.log("📊 Submitting MTO order to OT ingest...");
      
      const payload: OtOrderPayload = {
        order_number: `MTO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product_number: formData.productNumber || 'MTO',
        quantity: parseInt(formData.quantity) || 1,
        store: formData.store,
        plant: plant,
        submitted_by_email: managerEmail,
        submitted_by_name: formData.name,
      };

      console.log("📊 MTO Payload:", JSON.stringify(payload, null, 2));
      const result = await submitOtOrder(payload);

      if (!result.ok) {
        const status = 'status' in result ? result.status : 'unknown';
        const message = 'message' in result ? result.message : 'unknown error';
        console.error("❌ OT submit failed:", status, message);
        throw new Error(`Failed to submit MTO order: ${message}`);
      }

      console.log("✅ MTO submitted:", result.id, result.order_number);
      toast({
        title: "🎉 MTO order submitted successfully! 🎉",
        description: `Order ${result.order_number} has been submitted and is being processed!`,
      });
      resetForm();
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
