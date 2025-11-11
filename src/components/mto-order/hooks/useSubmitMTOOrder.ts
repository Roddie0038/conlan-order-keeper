import { submitOtOrder, type OtOrderPayload, isIngestFail } from "@/services/submitOtOrder";
import { getPlantForStore } from "@/utils/plantMapping";

export const useSubmitMTOOrder = ({ formData, setIsSubmitting, resetForm, toast }: any) => {
  const toInt = (v: unknown, fallback = 1) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      
      const plant = getPlantForStore(formData.store);
      
      // Build MTO payload with metadata for OT to route/process
      const payload: OtOrderPayload = {
        order_number: `MTO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product_number: String(formData.productNumber || 'MTO'),
        quantity: toInt(formData.quantity, 1),
        store: String(formData.store),
        plant: String(plant),
        submitted_by_email: formData.email || "",
        submitted_by_name: formData.name || formData.yourName || "",
        metadata: {
          type: "MTO",
          tread: formData.tread || undefined,
          tire_size: formData.tireSize || undefined,
          casing_grade: formData.casingGrade || undefined,
          notes: formData.notes || undefined,
        }
      };

      console.log("🚀 MTO FORM - Submitting to OT:", payload);
      const result = await submitOtOrder(payload);

      if (isIngestFail(result)) {
        console.error("❌ MTO FORM - OT submission failed:", result.status, result.message, result.trace_id);
        toast({
          title: "Submission Failed",
          description: `Error: ${result.message}. Trace ID: ${result.trace_id}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log(`✅ MTO FORM - Success from ${result.project}, order: ${result.order_number}, trace_id: ${result.trace_id}`);
      
      toast({
        title: "🎉 MTO Order Submitted!",
        description: `Order ${result.order_number} submitted to ${result.project}. Trace ID: ${result.trace_id}`,
      });
      
      resetForm();
    } catch (error: any) {
      console.error("❌ MTO FORM - Unexpected error:", error);
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
