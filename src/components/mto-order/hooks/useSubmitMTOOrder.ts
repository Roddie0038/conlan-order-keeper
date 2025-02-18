
import { MTOFormData } from "../mto-form-config";
import { storeManagerEmails } from "@/components/order-form/formConfig";
import { submitToGoogleSheets } from "@/services/sheets";

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
    console.log("Submitting MTO order to webhooks");

    try {
      const finalTireSize = formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize;
      
      const storeId = formData.store.split(' ')[1];
      const managerEmail = formData.store === "Admin" 
        ? storeManagerEmails["Admin"]
        : storeManagerEmails[storeId] || '';
      
      const orderData = {
        id: crypto.randomUUID(),
        ...formData,
        tireSize: finalTireSize,
        type: 'MTO' as const,
        managerEmail,
        triggered_from: window.location.origin,
      };

      const result = await submitToGoogleSheets(orderData);
      
      if (result.status === 'success' || result.status === 'partial_success') {
        const existingOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
        existingOrders.push(orderData);
        localStorage.setItem('mtoOrders', JSON.stringify(existingOrders));
        
        console.log("MTO order submitted successfully");
        
        toast({
          title: "Order Submitted Successfully",
          description: "Your MTO order has been submitted.",
        });

        resetForm();
      } else {
        throw new Error("Failed to submit order");
      }
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
