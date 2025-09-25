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

  // Helper function to resolve store color for pallet painting
  const resolveStoreColor = (formData: WheelFormData): string => {
    // Map store names to colors for pallet painting
    const storeColorMap: Record<string, string> = {
      'Fort Worth 022': 'Red',
      'Grand Prairie 027': 'Yellow', 
      'Houston 028': 'Cyan',
      'San Antonio 029': 'Gray',
      'Oklahoma City 030': 'Purple',
      'Little Rock 032': 'Orange',
      'Kansas City 033': 'Pink',
      'Laredo 035': 'Lime',
      'Tulsa 036': 'Green',
      'Austin 039': 'Blue',
      'Detroit 041': 'Mint',
      'Toledo 042': 'Gold',
      'Indianapolis 043': 'Magenta',
      'Tampa 051': 'Olive',
      'Orlando 052': 'Brown',
      'Jacksonville 053': 'Light Green',
      'Grand Prairie 097': 'Green',
      'Romulus 098': 'Hot Pink',
      'Mulberry 099': 'Navy'
    };

    // Try to match store name directly
    if (formData.storeName && storeColorMap[formData.storeName]) {
      return storeColorMap[formData.storeName];
    }

    // Fallback to storeColors if available (may be hex value)
    if (formData.storeColors) {
      return String(formData.storeColors);
    }

    return '';
  };

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
      
      // Store color for pallet painting
      store_color: resolveStoreColor(formData),
      
      // Metadata
      status: 'open',
      ordertype: 'WHEEL_POWDER_COATING',
      
      // Server timestamp will be set by edge function
      timestamp: new Date().toISOString(),
      
      // Additional details
      notes: `Customer: ${formData.customerName || 'N/A'}`,
      description: `${formData.wheelType} ${formData.wheelMaterial} wheel coating in ${formData.wheelColor}`
    };
  };

  // Whitelist allowed keys for insert
  const ALLOWED_KEYS = [
    'name','store','plant','quantity',
    'desiredcolor','wheelsize','wheelmaterial','wheeltype','handholes',
    'email','schedulearrival','status','ordertype','notes','description',
    'store_color'
  ];

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
      
      // Filter payload using allowed keys whitelist
      const insertPayload = Object.fromEntries(
        Object.entries(wheelOrderPayload).filter(([k]) => ALLOWED_KEYS.includes(k))
      );
      
      if (isDiagnosticEnabled) {
        setPreInsertPayload(insertPayload);
        updateLastStep('success', insertPayload);
        addStep("Submitting to Supabase wheel_orders table");
      }
      
      console.log("🔍 ENHANCED WHEEL FORM - Submitting whitelisted payload:", insertPayload);
      
      // R3: Single source of truth - Supabase insert first
      const { data: insertedOrder, error: supabaseError } = await supabase
        .from('wheel_orders')
        .insert(insertPayload)
        .select()
        .single();

      if (supabaseError) {
        console.error('❌ Wheel order insert failed:', supabaseError);
        toast({
          title: 'Order failed',
          description: supabaseError.message || 'Insert error',
          variant: 'destructive'
        });
        return;
      }

      if (isDiagnosticEnabled) {
        setInsertResponse(insertedOrder);
        updateLastStep('success', insertedOrder);
        addStep("Supabase insert completed successfully");
      }

      console.log("✅ ENHANCED WHEEL FORM - Successfully saved to Supabase:", insertedOrder);

      // Success banner uses **server** time if present
      const submittedAt = insertedOrder.timestamp || new Date().toISOString();
      setSubmissionResult({
        success: true,
        serverTimestamp: submittedAt,
        orderId: insertedOrder.id
      });
      
      // R3: Non-blocking Google Sheets submission with timeout
      if (isDiagnosticEnabled) {
        addStep("Submitting to Google Sheets (non-blocking)");
      }

      // Create OT payload with server timestamp
      const otPayload = {
        id: insertedOrder.id,
        store: formData.storeName,
        plant: formData.destinationPlant,
        quantity: parseInt(formData.qtyWheels) || 0,
        wheelmaterial: formData.wheelMaterial || "",
        wheeltype: formData.wheelType || "",
        wheelsize: formData.wheelSize || "",
        desiredcolor: formData.wheelColor || "",
        store_color: insertedOrder.store_color || "",
        status: "open",
        ordertype: "WHEEL_POWDER_COATING",
        timestamp: insertedOrder.timestamp,
        submitted_at: insertedOrder.timestamp, // duplicate for OT compatibility
        
        // Legacy fields for backward compatibility
        name: formData.yourName,
        productNumber: "WHEEL-COATING",
        description: insertedOrder.description || `Wheel coating - ${formData.wheelColor} - ${formData.wheelSize}`,
        scheduleArrival: formData.scheduleArrival,
        notes: insertedOrder.notes || "",
        email: managerEmail,
        type: "WHEEL_POWDER_COATING",
        crossDock: "No",
        crossDockType: "No",
        customerName: formData.customerName || "",
        handHoles: parseInt(formData.handHoles || "0"),
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
          body: JSON.stringify(otPayload)
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
        title: "Order submitted",
        description: `Ref ${insertedOrder.id}`,
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
