
// Patch MTO order submit hook with Supabase save-first approach before webhook submission.

import { MTOFormData } from "../mto-form-config";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { submitToGoogleSheets } from "@/services/sheets";
import { usePlant } from "@/contexts/PlantContext";
import { useAuth } from "@/contexts/AuthContext";
import { saveOrderToSupabase } from "@/services/orderService";

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
  const { selectedPlant } = usePlant();
  const { user } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.store) {
      toast({
        title: "Missing Store",
        description: "Please select a store.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.isAdmin && formData.store !== user?.store) {
      toast({
        title: "Unauthorized",
        description: "You can only submit orders for your own store.",
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
      const managersEmail = getManagerEmail(formData.store);
      console.log("Manager email for store:", formData.store, "is:", managersEmail);
      
      const orderData = {
        id: crypto.randomUUID(),
        ...formData,
        tireSize: finalTireSize,
        type: 'MTO' as const,
        managersEmail,
        managerEmail: managersEmail,
        triggered_from: window.location.origin,
        plant: selectedPlant,
        store: formData.store,
        timestamp: new Date().toISOString()
      };

      await saveOrderToSupabase({
        name: formData.name,
        store: formData.store,
        productNumber: formData.productNumber,
        description: `MTO: ${finalTireSize}, ${formData.tireTreadNeeded}, Grade: ${formData.casingGrade.join(',')}`,
        quantity: formData.quantity,
        scheduleArrival: formData.scheduleArrival || "",
        notes: formData.notes || "",
        email: managersEmail,
        timestamp: new Date().toISOString(),
        type: "MTO"
      });

      const result = await submitToGoogleSheets(orderData);
      
      if (result.status === 'success' || result.status === 'partial_success') {
        const existingOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
        existingOrders.push(orderData);
        localStorage.setItem('mtoOrders', JSON.stringify(existingOrders));
        
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
