
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { WEBHOOK_URLS } from "@/services/webhook/config";
import { saveOrderToSupabase } from "@/services/orderService";
import { WheelFormData } from "../types";
import { useWheelFormValidation } from "./useWheelFormValidation";

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

    if (!validateForm(formData, user?.isAdmin)) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🔍 WHEEL FORM - Preparing wheel order submission");
      console.log("🔍 WHEEL FORM - Verifying webhook URL from config:");
      console.log("🔍 WHEEL FORM - Target webhook URL will be:", WEBHOOK_URLS.WHEEL_ORDERS);
      console.log("🔍 WHEEL FORM - Expected URL: https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");
      console.log("🔍 WHEEL FORM - URLs match?", WEBHOOK_URLS.WHEEL_ORDERS === "https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");
      
      const submissionData = {
        yourName: formData.yourName,
        store: formData.storeName,
        storeId: formData.storeId,
        dateReceived: formData.dateReceived,
        type: "WHEEL_POWDER_COATING" as const,
        productNumber: "WHEEL-COATING",
        description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: formData.qtyWheels,
        scheduleArrival: formData.scheduleArrival || formData.dateReceived,
        notes: `Customer: ${formData.customerName}, Material: ${formData.wheelMaterial}, Type: ${formData.wheelType}, Hand Holes: ${formData.handHoles}`,
        crossDock: "No", // Default value for wheel orders - they are not cross-docked
        managersEmail: managerEmail,
        managerEmail: managerEmail,
        plant: selectedPlant,
        qtyWheels: formData.qtyWheels,
        customerName: formData.customerName,
        wheelMaterial: formData.wheelMaterial,
        wheelType: formData.wheelType,
        handHoles: formData.handHoles,
        wheelSize: formData.wheelSize,
        wheelColor: formData.wheelColor,
        timestamp: new Date().toISOString(),
      };

      console.log("🔍 WHEEL FORM - Submitting raw schedule arrival:", submissionData.scheduleArrival);
      console.log("🔍 WHEEL FORM - Full submission data:", JSON.stringify(submissionData, null, 2));

      const result = await submitToGoogleSheets(submissionData);
      
      // Save to Supabase - Updated to include crossDock
      await saveOrderToSupabase({
        name: formData.yourName,
        store: formData.storeName,
        productNumber: "WHEEL-COATING",
        description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: formData.qtyWheels,
        scheduleArrival: formData.scheduleArrival || formData.dateReceived,
        notes: `Customer: ${formData.customerName}, Material: ${formData.wheelMaterial}, Type: ${formData.wheelType}, Hand Holes: ${formData.handHoles}`,
        email: managerEmail,
        timestamp: new Date().toISOString(),
        type: "WHEEL_POWDER_COATING",
        crossDock: "No" // Added default value for wheel orders
      });
      
      if (result.status === 'success' || result.status === 'partial_success') {
        const existingOrders = JSON.parse(localStorage.getItem('wheelOrders') || '[]');
        existingOrders.push({
          ...submissionData,
          id: crypto.randomUUID()
        });
        localStorage.setItem('wheelOrders', JSON.stringify(existingOrders));

        toast({
          title: "Order Submitted",
          description: "Your wheel powder coating order has been submitted successfully.",
        });
        navigate('/dashboard');
      } else {
        throw new Error("Failed to submit order");
      }
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
