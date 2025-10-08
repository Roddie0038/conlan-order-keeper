
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/components/ui/use-toast";
import { submitOtOrder, type OtOrderPayload } from "@/services/submitOtOrder";
import { WheelFormData } from "../types";
import { useWheelFormValidation } from "./useWheelFormValidation";
import { getPlantForStore } from "@/utils/plantMapping";
import type { OrderData } from "@/types/supabase-extensions";

// Helper function to format dates as MM/DD/YYYY hh:mm AM/PM
const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
};

export function useWheelFormSubmission(formData: WheelFormData, managerEmail: string) {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateForm } = useWheelFormValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("🔍 WHEEL FORM SUBMISSION - ✅ SUBMIT TRIGGERED - Raw form data received:", JSON.stringify(formData, null, 2));

    if (!validateForm(formData, user?.isAdmin)) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🔍 WHEEL FORM - ✅ VALIDATION PASSED - Preparing wheel order submission");
      console.log("🔍 WHEEL FORM - ✅ FORM DATA VERIFICATION before submission:", {
        customerName: formData.customerName,
        wheelMaterial: formData.wheelMaterial,
        wheelType: formData.wheelType,
        handHoles: formData.handHoles,
        wheelSize: formData.wheelSize,
        wheelColor: formData.wheelColor,
        qtyWheels: formData.qtyWheels
      });
      
      // Determine plant based on store  
      const plantForOrder = getPlantForStore(formData.storeName);
      console.log(`🔍 WHEEL FORM - ✅ PLANT DETERMINED - '${plantForOrder}' for store: ${formData.storeName}`);
      
      // Format timestamps properly
      const currentTimestamp = formatTimestamp(new Date().toISOString());
      const formattedScheduleArrival = formData.scheduleArrival ? formatTimestamp(formData.scheduleArrival) : formatTimestamp(formData.dateReceived);
      const formattedReceivedAt = formatTimestamp(formData.dateReceived);
      
      // Create the order data with EXACT field names that the webhook expects
      const supabaseOrder: OrderData = {
        name: formData.yourName,
        store: formData.storeName,
        productNumber: "WHEEL-COATING",
        description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: parseInt(formData.qtyWheels) || 0,
        scheduleArrival: formattedScheduleArrival,
        notes: "",
          email: managerEmail,
          timestamp: currentTimestamp,
          type: "WHEEL_POWDER_COATING",
          plant: plantForOrder,
          status: "open",
        crossDock: "No" as const,
        crossDockType: "No" as const,
        
        // CRITICAL: Ensure all wheel specification fields are properly mapped
        customerName: formData.customerName || "",
        wheelMaterial: formData.wheelMaterial || "",
        wheelType: formData.wheelType || "",
        handHoles: parseInt(formData.handHoles || "0"),
        wheelSize: formData.wheelSize || "",
        wheelColor: formData.wheelColor || "",
        qtyWheels: formData.qtyWheels || "",
        
        // Additional fields for webhook processing
        yourName: formData.yourName,
        dateReceived: formData.dateReceived,
        managersEmail: managerEmail,
        storeColors: formData.storeColors || "Yellow"
      };

      console.log("🔍 WHEEL FORM - ✅ ORDER DATA CREATED - Final order data being submitted:", JSON.stringify(supabaseOrder, null, 2));
      console.log("🔍 WHEEL FORM - ✅ CRITICAL FIELDS verification:", {
        type: supabaseOrder.type,
        customerName: supabaseOrder.customerName,
        wheelMaterial: supabaseOrder.wheelMaterial,
        wheelType: supabaseOrder.wheelType,
        handHoles: supabaseOrder.handHoles,
        wheelSize: supabaseOrder.wheelSize,
        wheelColor: supabaseOrder.wheelColor,
        qtyWheels: supabaseOrder.qtyWheels
      });
      
      // Validate that all critical wheel data is present before submission
      if (!formData.wheelMaterial || !formData.wheelType || !formData.wheelSize || !formData.wheelColor || !formData.handHoles || !formData.customerName) {
        console.error("❌ WHEEL FORM - Missing critical wheel specification data:", {
          customerName: formData.customerName,
          wheelMaterial: formData.wheelMaterial,
          wheelType: formData.wheelType,
          wheelSize: formData.wheelSize,
          wheelColor: formData.wheelColor,
          handHoles: formData.handHoles
        });
        
        toast({
          title: "Missing Required Fields",
          description: "Please fill in all required fields before submitting.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      console.log("🔍 WHEEL FORM - ✅ ALL VALIDATIONS PASSED - Submitting to OT ingest");
      
      // Submit to OT function (NO Google Sheets, NO ordering DB)
      const plant = getPlantForStore(formData.storeName);
      const payload: OtOrderPayload = {
        order_number: `WHEEL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        product_number: "WHEEL-COATING",
        quantity: parseInt(formData.qtyWheels) || 0,
        store: formData.storeName,
        plant: plant,
        submitted_by_email: managerEmail || "",
        submitted_by_name: formData.yourName || "",
      };

      console.log("🔍 WHEEL Payload:", JSON.stringify(payload, null, 2));
      const result = await submitOtOrder(payload);

      if (!result.ok) {
        const status = 'status' in result ? result.status : 'unknown';
        const message = 'message' in result ? result.message : 'unknown error';
        console.error("❌ OT submit failed:", status, message);
        throw new Error(`Failed to submit wheel order: ${message}`);
      }

      console.log("✅ Wheel submitted:", result.id, result.order_number);
      
      const existingOrders = JSON.parse(localStorage.getItem('wheelOrders') || '[]');
      existingOrders.push({
        ...supabaseOrder,
        id: crypto.randomUUID()
      });
      localStorage.setItem('wheelOrders', JSON.stringify(existingOrders));

      toast({
        title: "🔧 Wheel order submitted successfully! 🔧",
        description: `Order ${result.order_number} has been submitted and is ready for processing!`,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error("❌ WHEEL FORM - Error submitting wheel order:", error);
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
