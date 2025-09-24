/**
 * Enhanced Wheel Form Submission Hook with Diagnostic Mode
 * Implements server timestamp, single source of truth, and diagnostic payload viewer
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { WheelFormData } from "../types";
import { useWheelFormValidation } from "./useWheelFormValidation";
import { useWheelDiagnostic } from "./useWheelDiagnostic";
import type { OrderFormData } from "@/types/orders";

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
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    serverTimestamp?: string;
    orderId?: string;
  } | null>(null);

  const {
    diagnosticData,
    addStep,
    updateLastStep,
    setPreInsertPayload,
    setInsertResponse,
    reset: resetDiagnostic,
    isEnabled: isDiagnosticEnabled
  } = useWheelDiagnostic();

  // Create optimized wheel order payload for Supabase
  const createWheelOrderPayload = (formData: WheelFormData, managerEmail: string) => {
    return {
      // Core identification
      name: formData.yourName,
      store: formData.storeName,
      plant: formData.destinationPlant,
      
      // Wheel specifications - exact field mapping to wheel_orders schema
      quantity: parseInt(formData.qtyWheels) || 0,
      desiredcolor: formData.wheelColor,
      wheelsize: formData.wheelSize,
      wheelmaterial: formData.wheelMaterial,
      wheeltype: formData.wheelType,
      handholes: parseInt(formData.handHoles) || 0,
      
      // Contact and scheduling
      email: managerEmail,
      schedulearrival: formData.scheduleArrival,
      
      // Metadata
      status: 'open',
      ordertype: 'WHEEL_POWDER_COATING',
      
      // Server timestamp will be set by edge function
      timestamp: new Date().toISOString(),
      
      // Additional details
      notes: `Customer: ${formData.customerName || 'N/A'}`,
      description: `${formData.wheelType} ${formData.wheelMaterial} wheel coating in ${formData.wheelColor}`,
      
      // Store colors for reference
      ...(formData.storeColors && { storeColors: formData.storeColors })
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDiagnosticEnabled) {
      resetDiagnostic();
      addStep("Form submission initiated");
    }
    
    console.log("🔍 ENHANCED WHEEL FORM - Starting submission with diagnostic mode:", isDiagnosticEnabled);
    
    // Validation including plant selection
    const newErrors: Record<string, string> = {};
    
    if (!formData.destinationPlant) {
      newErrors.destinationPlant = "Please select a destination plant";
    }

    if (!validateForm(formData, user?.isAdmin)) {
      newErrors.general = "Please fill in all required fields";
      setErrors(newErrors);
      if (isDiagnosticEnabled) {
        updateLastStep('error', null, 'Form validation failed');
      }
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      if (isDiagnosticEnabled) {
        updateLastStep('error', null, 'Validation errors present');
      }
      return;
    }

    if (isDiagnosticEnabled) {
      updateLastStep('success');
      addStep("Creating optimized payload");
    }

    setIsSubmitting(true);

    try {
      // Create the optimized payload
      const wheelOrderPayload = createWheelOrderPayload(formData, managerEmail);
      
      if (isDiagnosticEnabled) {
        setPreInsertPayload(wheelOrderPayload);
        updateLastStep('success', wheelOrderPayload);
        addStep("Submitting to Supabase wheel_orders table");
      }
      
      console.log("🔍 ENHANCED WHEEL FORM - Submitting optimized payload:", wheelOrderPayload);
      
      // R3: Single source of truth - Supabase insert first
      const { data: insertedOrder, error: supabaseError } = await supabase
        .from('wheel_orders')
        .insert(wheelOrderPayload)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (isDiagnosticEnabled) {
        setInsertResponse(insertedOrder);
        updateLastStep('success', insertedOrder);
        addStep("Supabase insert completed successfully");
      }

      console.log("✅ ENHANCED WHEEL FORM - Successfully saved to Supabase:", insertedOrder);

      // Set submission result for success banner
      setSubmissionResult({
        success: true,
        serverTimestamp: insertedOrder.timestamp,
        orderId: insertedOrder.id
      });
      
      // R3: Non-blocking Google Sheets submission with timeout
      if (isDiagnosticEnabled) {
        addStep("Submitting to Google Sheets (non-blocking)");
      }

      // Create legacy format for backward compatibility
      const legacyOrderData: OrderFormData = {
        name: formData.yourName,
        store: formData.storeName,
        productNumber: "WHEEL-COATING",
        description: insertedOrder.description || `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        quantity: parseInt(formData.qtyWheels) || 0,
        scheduleArrival: formData.scheduleArrival,
        notes: insertedOrder.notes || "",
        email: managerEmail,
        timestamp: insertedOrder.timestamp,
        type: "WHEEL_POWDER_COATING" as const,
        plant: formData.destinationPlant,
        status: "open",
        crossDock: "No" as const,
        crossDockType: "No" as const,
        
        // Wheel specification fields for legacy compatibility
        customerName: formData.customerName || "",
        wheelMaterial: formData.wheelMaterial || "",
        wheelType: formData.wheelType || "",
        handHoles: parseInt(formData.handHoles || "0"),
        wheelSize: formData.wheelSize || "",
        wheelColor: formData.wheelColor || "",
        qtyWheels: formData.qtyWheels || "",
        
        yourName: formData.yourName,
        dateReceived: formData.dateReceived,
        managersEmail: managerEmail,
        storeColors: formData.storeColors || "Yellow"
      };

      // R3: Non-blocking Google Sheets call with timeout
      const sheetsPromise = Promise.race([
        fetch(`https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/wheel-order-webhook`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
          },
          body: JSON.stringify(legacyOrderData)
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Google Sheets timeout')), 3000)
        )
      ]);

      // Fire and forget - don't block UI success
      sheetsPromise
        .then(response => {
          if (isDiagnosticEnabled) {
            updateLastStep('success', null, 'Google Sheets submission completed');
          }
          console.log("✅ ENHANCED WHEEL FORM - Google Sheets webhook completed");
        })
        .catch(error => {
          if (isDiagnosticEnabled) {
            updateLastStep('error', null, `Google Sheets error: ${error.message}`);
          }
          console.warn("⚠️ ENHANCED WHEEL FORM - Google Sheets webhook failed (non-blocking):", error);
        });
      
      // R2: Show success immediately based on Supabase success only
      toast({
        title: "🔧 Wheel order submitted successfully! 🔧",
        description: `Your wheel powder coating order has been submitted to ${formData.destinationPlant}!`,
      });

      if (isDiagnosticEnabled) {
        addStep("Form submission completed successfully", 'success');
      }

      console.log("✅ ENHANCED WHEEL FORM - Submission completed successfully with server timestamp:", insertedOrder.timestamp);
      
      // Navigate after a brief delay to show success banner
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error("❌ ENHANCED WHEEL FORM - Error submitting wheel order:", error);
      
      if (isDiagnosticEnabled) {
        updateLastStep('error', null, error instanceof Error ? error.message : 'Unknown error');
      }

      toast({
        title: "Error",
        description: "There was a problem submitting your order. Please try again.",
        variant: "destructive",
      });

      setSubmissionResult({
        success: false
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    isSubmitting, 
    handleSubmit, 
    submissionResult,
    diagnosticData,
    isDiagnosticEnabled
  };
}
