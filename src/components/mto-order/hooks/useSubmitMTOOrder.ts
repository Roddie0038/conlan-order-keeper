
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitOtOrder, type OtOrderPayload, isIngestFail } from "@/services/submitOtOrder";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
import { getPlantForStore } from "@/utils/plantMapping";
import { publishMTOOrderPlaced } from "@/services/webhookOutbox";

export const useSubmitMTOOrder = ({ formData, setIsSubmitting, resetForm, toast }: any) => {
  const { user } = useAuth();

  // Robust integer coercion
  const toInt = (v: unknown, fallback = 1) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : fallback;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation: Only validate truly required fields
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
      const managerEmail = (await getFirstManagerEmail(formData.store) ?? formData.email ?? user?.email ?? '').trim();
      const submitterName = (formData.name ?? formData.yourName ?? user?.name ?? '').trim();
      const plant = getPlantForStore(formData.store);
      
      console.log("🔍 MTO FORM - Manager email:", managerEmail);
      console.log("🔍 MTO FORM - Plant:", plant);
      
      // Validate email format
      if (!managerEmail || !managerEmail.includes('@')) {
        toast({
          title: "Validation Error", 
          description: "A valid email is required.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Build MTO payload with safe types
      const payload = {
        order_number: `MTO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product_number: String(formData.productNumber || 'MTO'),
        quantity: toInt(formData.quantity, 1),
        store: String(formData.store),
        plant: String(plant),
        submitted_by_email: managerEmail,
        submitted_by_name: submitterName,
      } satisfies OtOrderPayload;

      console.log("📊 MTO Payload:", JSON.stringify(payload, null, 2));
      const result = await submitOtOrder(payload);

      if (isIngestFail(result)) {
        // result is IngestFail here
        console.error("❌ OT submit failed:", result.status, result.message);
        throw new Error(`Failed to submit MTO order: ${result.message}`);
      }

      // result is IngestOk here
      console.log("✅ MTO submitted:", result.id, result.order_number);
      
      // Enqueue webhook event to outbox (non-blocking)
      try {
        const traceId = `mto-${result.id}-${Date.now()}`;
        console.log("📤 WEBHOOK OUTBOX - Enqueuing MTOOrderPlaced event, trace_id:", traceId);
        
        const webhookResult = await publishMTOOrderPlaced({
          order_id: result.id,
          order_number: result.order_number,
          store: String(formData.store),
          plant: String(plant),
          product_number: String(formData.productNumber || 'MTO'),
          description: `MTO Order - ${formData.tread || ''} ${formData.tireSize || ''}`.trim(),
          quantity: toInt(formData.quantity, 1),
          status: "open",
          submitted_by_name: submitterName,
          submitted_by_email: managerEmail,
          order_type: "MTO",
          metadata: {
            tread: formData.tread || undefined,
            tire_size: formData.tireSize || undefined,
            casing_grade: formData.casingGrade || undefined,
            notes: formData.notes || undefined,
            ot_created_at: result.created_at,
            idempotent: result.idempotent || false
          }
        }, traceId);

        if (webhookResult.success) {
          console.log("✅ WEBHOOK OUTBOX - MTO event enqueued:", webhookResult.event_id);
        } else {
          console.warn("⚠️ WEBHOOK OUTBOX - Failed to enqueue MTO event:", webhookResult.error);
        }
      } catch (err) {
        console.warn("⚠️ WEBHOOK OUTBOX - Non-fatal error enqueuing MTO event:", err);
      }
      
      toast({
        title: "🎉 MTO order submitted!",
        description: `Order ${result.order_number} has been submitted.`,
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
