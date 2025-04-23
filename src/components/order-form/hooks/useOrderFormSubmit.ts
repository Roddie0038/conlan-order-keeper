
// Patch useOrderFormSubmit to save to Supabase first and still send to Google Sheets.

import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { OrderFormValues } from "../order-form-schema";
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
    setIsSubmitting(true);
    
    const managersEmail = getManagerEmail(values.store);
    console.log("Schedule arrival in form submit:", values.scheduleArrival);
    
    try {
      const pendingOrders = JSON.parse(localStorage.getItem("pendingOrders") || "[]");
      const newOrder = {
        ...values,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        managersEmail,
        plant: selectedPlant,
        type: "TRANSFER"
      };
      
      // Save to Supabase first
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
        email: managersEmail,
        timestamp: new Date().toISOString(),
        type: "TRANSFER"
      });

      // Then submit to Google Sheets (submits to webhook too)
      const result = await submitToGoogleSheets({
        ...values,
        yourName: values.yourName,
        store: values.store,
        dateReceived: values.dateReceived,
        productNumber: values.productNumber,
        description: values.description,
        quantity: values.quantity,
        scheduleArrival: values.scheduleArrival,
        notes: values.notes || "",
        crossDock: values.crossDock,
        timestamp: new Date().toISOString(),
        managersEmail,
        plant: selectedPlant,
        type: "TRANSFER"
      });

      pendingOrders.push(newOrder);
      localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));
      
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
