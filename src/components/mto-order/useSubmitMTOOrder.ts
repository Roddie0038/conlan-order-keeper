import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { MTOFormData } from "./types";

export const useSubmitMTOOrder = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOrder = async (formData: MTOFormData) => {
    setIsSubmitting(true);
    console.log("Submitting MTO order to Zapier webhook");

    try {
      const finalTireSize = formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize;
      
      const orderData = {
        ...formData,
        tireSize: finalTireSize,
        type: 'MTO',
        triggered_from: window.location.origin,
      };

      await fetch(
        "https://hooks.zapier.com/hooks/catch/21441385/2atp7qy/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors",
          body: JSON.stringify(orderData),
        }
      );
      
      console.log("MTO order submitted successfully");
      
      toast({
        title: "Order Submitted Successfully",
        description: "Your MTO order has been submitted.",
      });

      return true;
    } catch (error) {
      console.error("Error submitting MTO order:", error);
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, isSubmitting };
};