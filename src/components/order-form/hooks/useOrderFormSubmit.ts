
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { OrderFormValues, validateCrossDockFields } from "../order-form-schema";
import { saveOrderToSupabase } from "@/services/orderService";

interface UseOrderFormSubmitProps {
  setIsSubmitting: (value: boolean) => void;
  selectedPlant: string;
  resetForm: () => void;
}

export function useOrderFormSubmit({ 
  setIsSubmitting, 
  selectedPlant,
  resetForm 
}: UseOrderFormSubmitProps) {
  const { toast } = useToast();

  return async (values: OrderFormValues) => {
    // Validate cross dock fields if cross dock is "yes"
    if (values.crossDock === "yes") {
      const { isValid, errors } = validateCrossDockFields(values);
      
      if (!isValid) {
        // Show the first error
        const firstError = Object.entries(errors)[0];
        toast({
          title: "Form Incomplete",
          description: firstError[1],
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    
    // Get the manager's email for the selected store
    const managersEmail = getManagerEmail(values.store);
    console.log("Schedule arrival in form submit:", values.scheduleArrival);
    
    try {
      // Add order to localStorage
      const pendingOrders = JSON.parse(localStorage.getItem("pendingOrders") || "[]");
      const newOrder = {
        ...values,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        managersEmail,
        plant: selectedPlant,
        type: "TRANSFER" // Set explicit type for TypeScript
      };
      
      pendingOrders.push(newOrder);
      localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));
      
      // Submit to Google Sheets
      const result = await submitToGoogleSheets({
        ...values,
        yourName: values.yourName,  // Explicitly include required fields
        store: values.store,
        dateReceived: values.dateReceived,  // Use string value directly
        productNumber: values.productNumber,
        description: values.description,
        quantity: values.quantity,
        scheduleArrival: values.scheduleArrival,  // Send the weekday name directly
        notes: values.notes || "",
        crossDock: values.crossDock,
        crossDockDestination: values.crossDockDestination || "",
        receiverNo: values.receiverNo || "", // Renamed from transferWorkOrderNumber
        etaDate: values.etaDate || "",
        crossDockConfirmation: values.crossDockConfirmation || false,
        timestamp: new Date().toISOString(),
        managersEmail,
        plant: selectedPlant,
        type: "TRANSFER" // Set explicit type for OrderType
      });

      // Save to Supabase
      await saveOrderToSupabase({
        name: values.yourName,
        store: values.store,
        productNumber: values.productNumber,
        description: values.description,
        quantity: values.quantity,
        scheduleArrival: values.scheduleArrival,
        notes: values.notes || "",
        crossDock: values.crossDock,
        crossDockDestination: values.crossDockDestination,
        receiverNo: values.receiverNo, // Renamed from transferWorkOrderNumber
        etaDate: values.etaDate,
        email: managersEmail,
        timestamp: new Date().toISOString(),
        type: "TRANSFER"
      });
      
      if (result.status === "success") {
        toast({
          title: "Order Submitted",
          description: "Your order has been submitted successfully.",
        });
        resetForm();
      } else {
        toast({
          title: "Failed to Submit",
          description: "There was an error submitting your order to Google Sheets.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
}
