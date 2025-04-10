
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { OrderFormValues } from "../order-form-schema";

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
    setIsSubmitting(true);
    
    // Get the manager's email for the selected store
    const managersEmail = getManagerEmail(values.store);
    
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
        dateReceived: values.dateReceived.toISOString(),
        productNumber: values.productNumber,
        description: values.description,
        quantity: values.quantity,
        scheduleArrival: values.scheduleArrival,
        notes: values.notes || "",
        crossDock: values.crossDock,
        timestamp: new Date().toISOString(),
        managersEmail,
        plant: selectedPlant,
        type: "TRANSFER" // Set explicit type for OrderType
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
