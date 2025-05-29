
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { WEBHOOK_URLS } from "@/services/webhook/config";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { getPlantForStore } from "@/utils/plantMapping";
import type { OrderData } from "@/types/supabase-extensions";

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
      
      console.log("🔍 MTO FORM - Manager email:", managerEmail);
      console.log("🔍 MTO FORM - Plant:", plant);

      const submissionData = {
        timestamp: formData.timestamp,
        name: formData.name,
        store: formData.store,
        productNumber: formData.productNumber,
        casingGrade: formData.casingGrade.join(", "),
        tireSize: formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize,
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

      // Prepare data for Supabase with correct field names
      const supabaseOrder: OrderData = {
        name: formData.name,
        store: formData.store,
        product_number: formData.productNumber,
        description: `MTO - ${formData.tireTreadNeeded} - ${formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize}`,
        quantity: parseInt(formData.quantity) || 0,
        schedule_arrival: "TBD",
        notes: formData.notes,
        email: managerEmail,
        plant: plant,
        timestamp: new Date().toISOString(),
        type: "MTO",
        status: "open",
        crossDock: "No" as "Yes" | "No",
        
        // MTO-specific fields (these will be stored in the extended data)
        casing_grade: formData.casingGrade.join(", "),
        tire_size: formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize,
        tread: formData.tireTreadNeeded
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
