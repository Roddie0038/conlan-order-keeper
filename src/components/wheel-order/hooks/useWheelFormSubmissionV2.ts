/**
 * Phase 2: Updated Wheel Form Submission Hook
 * Now uses unified order submission service with standardized payload handling
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { submitWheelOrder } from "@/services/unifiedOrderService";
import { WheelFormData } from "../types";
import { useWheelFormValidation } from "./useWheelFormValidation";
import OrderIDService from "@/services/OrderIDService";

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
    
    console.log("🔍 PHASE 2 WHEEL FORM - Starting submission with form data:", formData);
    
    // Critical debug: Check storeId
    if (!formData.storeId) {
      console.warn("🚨 PHASE 2 WHEEL FORM - storeId is missing at submission!");
    }
    
    // Validation including plant selection
    const newErrors: Record<string, string> = {};
    
    if (!formData.destinationPlant) {
      newErrors.destinationPlant = "Please select a destination plant";
      console.warn("🚨 PHASE 2 WHEEL FORM - Missing destination plant");
    }

    if (!validateForm(formData, user?.isAdmin)) {
      newErrors.general = "Please fill in all required fields";
      setErrors(newErrors);
      console.warn("🚨 PHASE 2 WHEEL FORM - Validation failed");
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
      console.log("🔍 PHASE 2 WHEEL FORM - Starting submission with plant:", formData.destinationPlant);
      
      console.log("✅ PHASE 2 WHEEL FORM - Using selected plant:", formData.destinationPlant);
      console.log("✅ PHASE 2 WHEEL FORM - Submitting with storeId:", formData.storeId);
      
      // ✅ PHASE 2: Submit using unified wheel order service with proper normalization
      const submissionResult = await submitWheelOrder(formData, user);
      
      if (!submissionResult.success || submissionResult.error) {
        throw new Error(`Failed to submit wheel order: ${submissionResult.error?.message}`);
      }

      console.log("✅ PHASE 2 WHEEL FORM - Successfully saved to Supabase:", {
        id: submissionResult.data?.id,
        plant: formData.destinationPlant,
        store: formData.storeName
      });
      
      // ✅ PHASE 3: Send notification using new unified resolution system
      if (submissionResult.data?.id) {
        try {
          console.log("🛡️ PHASE 4 WHEEL FORM - Sending notification via hardened service");
          
          const { hardenedNotificationService } = await import("@/services/notificationHardeningService");
          
          const notificationResult = await hardenedNotificationService.sendHardenedNotification(
            {
              store: formData.storeName,
              plant: formData.destinationPlant,
              email: managerEmail,
              name: formData.yourName
            },
            'wheel',
            submissionResult.data.id.toString(),
            {
              product_number: `${formData.wheelMaterial} ${formData.wheelSize}`,
              description: `${formData.wheelType} - ${formData.wheelColor}`,
              quantity: parseInt(formData.qtyWheels) || 0
            }
          );
          
          if (notificationResult.success) {
            console.log(`✅ PHASE 4 WHEEL FORM - Hardened notification succeeded: ${notificationResult.totalAttempts} attempts, ${notificationResult.recipients_count} recipients, status: ${notificationResult.finalStatus}`);
          } else {
            console.warn("⚠️ PHASE 4 WHEEL FORM - Hardened notification failed:", notificationResult.message, `Final status: ${notificationResult.finalStatus}`);
          }
        } catch (emailError) {
          console.error("❌ PHASE 4 WHEEL FORM - Error sending hardened notification:", emailError);
        }
      }
      
      // ✅ Keep existing Google Sheets submission for backward compatibility
      const currentTimestamp = formatTimestamp(new Date().toISOString());
      const formattedScheduleArrival = formData.scheduleArrival ? formatTimestamp(formData.scheduleArrival) : formatTimestamp(formData.dateReceived);
      
      // Create legacy format for Google Sheets
      const legacyOrderData = {
        name: formData.yourName,
        store: formData.storeName,
        productNumber: "WHEEL-COATING",
        description: `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: parseInt(formData.qtyWheels) || 0,
        scheduleArrival: formattedScheduleArrival,
        notes: "",
        email: managerEmail,
        timestamp: currentTimestamp,
        type: "WHEEL_POWDER_COATING" as const,
        plant: formData.destinationPlant,
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
      
      console.log("🔍 PHASE 2 WHEEL FORM - Submitting to Google Sheets...");
      
      const result = await submitToGoogleSheets(legacyOrderData);
      
      console.log("✅ PHASE 2 WHEEL FORM - Google Sheets result:", result);
      
      if (result.status === 'success' || result.status === 'partial_success' || submissionResult.data) {
        // Store in localStorage for backward compatibility
        const existingOrders = JSON.parse(localStorage.getItem('wheelOrders') || '[]');
        existingOrders.push({
          ...legacyOrderData,
          id: OrderIDService.generateOrderID('WHEEL_POWDER_COATING')
        });
        localStorage.setItem('wheelOrders', JSON.stringify(existingOrders));

        toast({
          title: "🔧 Wheel order submitted successfully! 🔧",
          description: `Your wheel powder coating order has been submitted to ${formData.destinationPlant}! ✅ Supabase: SUCCESS | 📊 Google Sheets: ${result.status}`,
        });
        navigate('/dashboard');
      } else {
        throw new Error(`Failed to submit order. Supabase: ${submissionResult.data ? 'OK' : 'FAILED'}, Google Sheets: ${result.status}`);
      }
    } catch (error) {
      console.error("❌ PHASE 2 WHEEL FORM - Error submitting wheel order:", error);
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
