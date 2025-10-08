
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitOtOrder, type OtOrderPayload } from "@/services/submitOtOrder";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
import { getPlantForStore } from "@/utils/plantMapping";

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
      const payload: OtOrderPayload = {
        order_number: `MTO-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product_number: String(formData.productNumber || 'MTO'),
        quantity: toInt(formData.quantity, 1),
        store: String(formData.store),
        plant: String(plant),
        submitted_by_email: managerEmail,
        submitted_by_name: submitterName,
      };

      console.log("📊 MTO Payload:", JSON.stringify(payload, null, 2));
      const result = await submitOtOrder(payload);

      if (!result.ok) {
        console.error("❌ OT submit failed:", result.status, result.message);
        throw new Error(`Failed to submit MTO order: ${result.message}`);
      }

      console.log("✅ MTO submitted:", result.id, result.order_number);
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
