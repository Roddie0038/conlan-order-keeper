
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { saveOrderToSupabase } from "@/services/orderService";
import { WheelFormData } from "../types";
import { useWheelFormValidation } from "./useWheelFormValidation";
import type { OrderData } from "@/types/supabase-extensions";
import { normalizeStoreForSubmission, normalizeOrderStoreFields } from "@/utils/storeNormalization";

const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`;
};

export function useWheelFormSubmission(
  formData: WheelFormData, 
  managerEmail: string, 
  errors: Record<string, string>,
  setErrors: (errors: Record<string, string>) => void
) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { validateForm } = useWheelFormValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🔍 WHEEL FORM - Starting submission with form data:", formData);
    
    // Critical debug: Check storeId
    if (!formData.storeId) {
      console.warn("🚨 WHEEL FORM - storeId is missing at submission!");
    }
    
    // Validation including plant selection
    const newErrors: Record<string, string> = {};
    
    if (!formData.destinationPlant) {
      newErrors.destinationPlant = "Please select a destination plant";
      console.warn("🚨 WHEEL FORM - Missing destination plant");
    }

    if (!validateForm(formData, user?.isAdmin)) {
      newErrors.general = "Please fill in all required fields";
      setErrors(newErrors);
      console.warn("🚨 WHEEL FORM - Validation failed");
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🔍 WHEEL FORM - Starting submission with plant:", formData.destinationPlant);
      
      const normalizedStoreName = normalizeStoreForSubmission(formData.storeName);
      
      console.log("✅ WHEEL FORM - Using selected plant:", formData.destinationPlant);
      console.log("✅ WHEEL FORM - Submitting with storeId:", formData.storeId);
      
      const currentTimestamp = formatTimestamp(new Date().toISOString());
      const formattedScheduleArrival = formData.scheduleArrival ? formatTimestamp(formData.scheduleArrival) : formatTimestamp(formData.dateReceived);
      const formattedReceivedAt = formatTimestamp(formData.dateReceived);
      
      // Create order data using the selected plant directly
      const baseOrder: OrderData = {
        name: formData.yourName,
        store: normalizedStoreName,
        productNumber: "WHEEL-COATING",
        description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: parseInt(formData.qtyWheels) || 0,
        scheduleArrival: formattedScheduleArrival,
        notes: "",
        email: managerEmail,
        timestamp: currentTimestamp,
        type: "WHEEL_POWDER_COATING",
        plant: formData.destinationPlant, // ✅ Use selected plant directly
        status: "open",
        crossDock: "No" as const,
        crossDockType: "No" as const,
        
        // Wheel specification fields
        customerName: formData.customerName || "",
        wheelMaterial: formData.wheelMaterial || "",
        wheelType: formData.wheelType || "",
        handHoles: parseInt(formData.handHoles || "0"),
        wheelSize: formData.wheelSize || "",
        wheelColor: formData.wheelColor || "",
        qtyWheels: formData.qtyWheels || "",
        
        // Additional fields
        yourName: formData.yourName,
        dateReceived: formData.dateReceived,
        managersEmail: managerEmail,
        storeColors: formData.storeColors || "Yellow"
      };
      
      const supabaseOrder = normalizeOrderStoreFields(baseOrder);

      console.log("🔍 WHEEL FORM - Final order data:", {
        plant: supabaseOrder.plant,
        store: supabaseOrder.store,
        type: supabaseOrder.type,
        storeId: formData.storeId
      });
      
      console.log("🔍 WHEEL FORM - Submitting to Google Sheets...");
      
      const result = await submitToGoogleSheets(supabaseOrder);
      
      console.log("✅ WHEEL FORM - Google Sheets result:", result);
      
      // Save to Supabase
      await saveOrderToSupabase(supabaseOrder);
      
      if (result.status === 'success' || result.status === 'partial_success') {
        const existingOrders = JSON.parse(localStorage.getItem('wheelOrders') || '[]');
        existingOrders.push({
          ...supabaseOrder,
          id: crypto.randomUUID()
        });
        localStorage.setItem('wheelOrders', JSON.stringify(existingOrders));

        toast({
          title: "🔧 Wheel order submitted successfully! 🔧",
          description: `Your wheel powder coating order has been submitted to ${formData.destinationPlant}!`,
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
