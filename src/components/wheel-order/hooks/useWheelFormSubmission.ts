import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitOtOrder, type OtOrderPayload } from "@/services/submitOtOrder";
import { WheelFormData } from "../types";
import { useWheelFormValidation } from "./useWheelFormValidation";
import { getPlantForStore } from "@/utils/plantMapping";
import { getStoreColorName } from "@/utils/storeColorMapping";

export function useWheelFormSubmission(formData: WheelFormData, managerEmail: string) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateForm } = useWheelFormValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm(formData, user?.isAdmin)) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🔍 WHEEL FORM - Validation passed, preparing submission");
      
      // Validate critical fields
      if (!formData.wheelMaterial || !formData.wheelType || !formData.wheelSize || 
          !formData.wheelColor || !formData.handHoles || !formData.customerName) {
        toast({
          title: "Missing Required Fields",
          description: "Please fill in all required fields before submitting.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const plant = getPlantForStore(formData.storeName);
      const storeColor = getStoreColorName(formData.storeName);
      
      // Build payload with top-level type for OT to route/process
      const payload: OtOrderPayload = {
        type: "WHEEL_POWDER_COATING",
        order_number: `WHEEL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product_number: "WHEEL-COATING",
        quantity: parseInt(formData.qtyWheels) || 0,
        store: formData.storeName,
        plant: plant,
        submitted_by_email: managerEmail || user?.email || "",
        submitted_by_name: formData.yourName || "",
        metadata: {
          customer_name: formData.customerName,
          wheel_material: formData.wheelMaterial,
          wheel_type: formData.wheelType,
          hand_holes: parseInt(formData.handHoles || "0"),
          wheel_size: formData.wheelSize,
          wheel_color: formData.wheelColor,
          qty_wheels: formData.qtyWheels,
          date_received: formData.dateReceived,
          schedule_arrival: formData.scheduleArrival || formData.dateReceived,
          store_color: storeColor,
        }
      };

      console.log("🚀 WHEEL FORM - Submitting to OT:", payload);
      const result = await submitOtOrder(payload);

      if (result.ok === false) {
        console.error("❌ WHEEL FORM - OT submission failed:", result.status, result.message, result.trace_id);
        toast({
          title: "Submission Failed",
          description: `Error: ${result.message}. Trace ID: ${result.trace_id}`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log(`✅ WHEEL FORM - Success from ${result.project}, order: ${result.order_number}, trace_id: ${result.trace_id}`);
      
      toast({
        title: "🔧 Wheel Order Submitted! 🔧",
        description: `Order ${result.order_number} submitted to ${result.project}. Trace ID: ${result.trace_id}`,
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("❌ WHEEL FORM - Unexpected error:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, handleSubmit };
}
