
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

    if (!validateForm(formData, user?.isAdmin)) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("🔍 WHEEL FORM - Preparing wheel order submission");
      console.log("🔍 WHEEL FORM - Form data before submission:", JSON.stringify(formData, null, 2));
      console.log("🔍 WHEEL FORM - Verifying webhook URL from config:");
      console.log("🔍 WHEEL FORM - Target webhook URL will be:", WEBHOOK_URLS.WHEEL_ORDERS);
      
      // Determine plant based on store
      const plant = getPlantForStore(formData.storeName);
      console.log(`🔍 WHEEL FORM - Determined plant '${plant}' for store: ${formData.storeName}`);
      
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
        plant: plant,
        status: "open",
        crossDock: "No" as const,
        crossDockType: "No" as const,
        
        // CRITICAL FIX: Ensure all wheel specification fields are included
        customerName: formData.customerName,
        wheelMaterial: formData.wheelMaterial,
        wheelType: formData.wheelType,
        handHoles: parseInt(formData.handHoles) || 0,
        wheelSize: formData.wheelSize,
        wheelColor: formData.wheelColor,
        qtyWheels: formData.qtyWheels,
        
        // Additional fields for webhook processing
        yourName: formData.yourName,
        dateReceived: formData.dateReceived,
        managersEmail: managerEmail,
        storeColors: "Yellow" // Default store color
      };

      console.log("🔍 WHEEL FORM - Final order data with all wheel specs:", JSON.stringify(supabaseOrder, null, 2));
      
      // Validate that all critical wheel data is present before submission
      if (!formData.wheelMaterial || !formData.wheelType || !formData.wheelSize || !formData.wheelColor || !formData.handHoles) {
        console.error("❌ WHEEL FORM - Missing critical wheel specification data:", {
          wheelMaterial: formData.wheelMaterial,
          wheelType: formData.wheelType,
          wheelSize: formData.wheelSize,
          wheelColor: formData.wheelColor,
          handHoles: formData.handHoles
        });
        
        toast({
          title: "Missing Wheel Specifications",
          description: "Please fill in all wheel specification fields before submitting.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await submitToGoogleSheets(supabaseOrder);
      
      // Save to Supabase with properly typed data
      await saveOrderToSupabase(supabaseOrder);
      
      if (result.status === 'success' || result.status === 'partial_success') {
        const existingOrders = JSON.parse(localStorage.getItem('wheelOrders') || '[]');
        existingOrders.push({
          ...supabaseOrder,
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
