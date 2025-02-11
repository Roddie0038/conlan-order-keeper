
import { MTOFormData } from "../mto-form-config";

interface SubmitMTOOrderProps {
  formData: MTOFormData;
  setIsSubmitting: (value: boolean) => void;
  resetForm: () => void;
  toast: any;
}

export const useSubmitMTOOrder = ({ 
  formData, 
  setIsSubmitting, 
  resetForm,
  toast 
}: SubmitMTOOrderProps) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("Submitting MTO order to Zapier webhook");

    try {
      const finalTireSize = formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize;
      
      const orderData = {
        id: crypto.randomUUID(),
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
      
      const existingOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
      existingOrders.push(orderData);
      localStorage.setItem('mtoOrders', JSON.stringify(existingOrders));
      
      console.log("MTO order submitted successfully");
      
      toast({
        title: "Order Submitted Successfully",
        description: "Your MTO order has been submitted.",
      });

      resetForm();
    } catch (error) {
      console.error("Error submitting MTO order:", error);
      toast({
        title: "Error",
        description: "Failed to submit order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return handleSubmit;
};
