
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { WEBHOOK_URLS } from "@/services/webhook/config";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { getPlantForStore } from "@/utils/plantMapping";
import type { MTOOrderData } from "@/types/supabase-extensions";

export const useSubmitMTOOrder = ({ formData, setIsSubmitting, resetForm, toast }: any) => {
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

      // ✅ FOR GOOGLE SHEETS (camelCase is fine)
      const submissionData = {
        timestamp: formData.timestamp,
        name: formData.name,
        store: formData.store,
        productNumber: formData.productNumber,
        casingGrade: formData.casingGrade.join(", "),
        tireSize,
        tireTreadNeeded: formData.tireTreadNeeded,
        quantity: formData.quantity,
        notes: formData.notes,
        managerEmail: managerEmail,
        plant: plant,
        status: "open",
        type: "MTO"
      };

      console.log("🔍 MTO FORM - Submission data:", submissionData);
      console.log("🔍 MTO FORM - Target webhook URL:", WEBHOOK_URLS.MTO_ORDERS);

      // Submit to Google Sheets
      const result = await submitToGoogleSheets(submissionData);
      console.log("🔍 MTO FORM - Google Sheets result:", result);

      // ✅ FOR SUPABASE (snake_case only, matches MTOOrderData)
      const supabaseOrder: MTOOrderData = {
        name: formData.name,
        store: formData.store,
        product_number: formData.productNumber,
        casing_grade: formData.casingGrade.join(", "),
        tire_size: tireSize,
        tread: formData.tireTreadNeeded,
        tire_tread_needed: formData.tireTreadNeeded,
        quantity: parseInt(formData.quantity) || 0,
        notes: formData.notes || "",
        email: managerEmail,
        manager_email: managerEmail,
        plant: plant,
        timestamp: timestamp,
        type: "MTO",
        order_type: "MTO",
        status: "open",
        description: `MTO - ${formData.tireTreadNeeded} - ${tireSize}`,
      };

      // Save to Supabase
      await saveOrderToSupabase(supabaseOrder);
      console.log("🔍 MTO FORM - Saved to Supabase successfully");

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
