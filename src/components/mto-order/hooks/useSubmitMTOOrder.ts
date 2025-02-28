
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
    
    // Validate required fields
    if (!formData.store) {
      toast({
        title: "Missing Store",
        description: "Please select a store.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.name) {
      toast({
        title: "Missing Name",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.productNumber) {
      toast({
        title: "Missing Product Number",
        description: "Please enter a product number.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.casingGrade.length === 0) {
      toast({
        title: "Missing Casing Grade",
        description: "Please select at least one casing grade.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.tireSize) {
      toast({
        title: "Missing Tire Size",
        description: "Please select a tire size.",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.tireSize === 'custom' && !formData.customTireSize) {
      toast({
        title: "Missing Custom Tire Size",
        description: "Please enter your custom tire size.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.tireTreadNeeded) {
      toast({
        title: "Missing Tire Tread",
        description: "Please enter the tire tread needed.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.quantity) {
      toast({
        title: "Missing Quantity",
        description: "Please enter a quantity.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log("Submitting MTO order to webhooks");

    try {
      const finalTireSize = formData.tireSize === 'custom' ? formData.customTireSize : formData.tireSize;
      
      const storeId = formData.store.split(' ')[1];
      const managersEmail = formData.store === "Admin" 
        ? storeManagerEmails["Admin"]
        : storeManagerEmails[storeId] || '';
      
      const orderData = {
        id: crypto.randomUUID(),
        ...formData,
        tireSize: finalTireSize,
        type: 'MTO' as const,
        managersEmail,
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
