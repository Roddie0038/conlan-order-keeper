
import { MTOFormData } from "../mto-form-config";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { submitToGoogleSheets } from "@/services/sheets";
import { usePlant } from "@/contexts/PlantContext";
import { useAuth } from "@/contexts/AuthContext";
import { saveOrderToSupabase } from "@/services/orderService";
import { getPlantForStore } from "@/utils/plantMapping";
import { formatDateForSupabase } from "@/utils/dateTime";
import type { OrderData } from "@/types/supabase-extensions";

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
    
    // Validate required fields
    if (!formData.store) {
      toast({
        title: "Missing Store",
        description: "Please select a store.",
        variant: "destructive",
      });
      return;
    }
    
    // If user is not admin, they can only submit orders for their store
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
      
      // Get the manager's email for the selected store
      const managersEmail = getManagerEmail(formData.store);
      console.log("Manager email for store:", formData.store, "is:", managersEmail);
      
      // Determine plant based on store
      const plant = getPlantForStore(formData.store);
      console.log(`Determined plant '${plant}' for store: ${formData.store}`);
      
      // Generate a UUID for the order
      const orderId = crypto.randomUUID();
      
      // Format timestamp for Supabase in MM/DD-YYYY HH:MM AM/PM format
      const formattedTimestamp = formatDateForSupabase(new Date());
      
      // Data for Google Sheets webhook (using frontend naming convention)
      const orderData = {
        id: orderId,
        ...formData,
        tireSize: finalTireSize,
        type: 'MTO' as const,
        managersEmail,
        managerEmail: managersEmail,
        triggered_from: window.location.origin,
        plant: plant,
        store: formData.store,
        timestamp: new Date().toISOString() // Keep ISO format for Google Sheets
      };

      console.log("Sending order data to webhook:", orderData);
      const result = await submitToGoogleSheets(orderData);
      
      // Create an order object for Supabase using the correct field names
      const supabaseOrder: OrderData = {
        id: orderData.id, // Include UUID for MTO orders
        name: formData.name,
        store: formData.store,
        productNumber: formData.productNumber, // Use camelCase for OrderData type
        description: `MTO: ${finalTireSize}, ${formData.tireTreadNeeded}, Grade: ${formData.casingGrade.join(',')}`,
        quantity: formData.quantity,
        scheduleArrival: formData.scheduleArrival || "",
        notes: formData.notes || "",
        email: managersEmail,
        timestamp: formattedTimestamp, // Use formatted timestamp for Supabase
        type: "MTO",
        plant: plant,
        
        // Cross dock fields in database format
        cross_dock_type: "No" as "Yes" | "No",
        
        // MTO-specific fields
        casingGrade: formData.casingGrade,
        tireSize: finalTireSize,
        tireTreadNeeded: formData.tireTreadNeeded
      };
      
      // Save to Supabase with appropriate type information
      await saveOrderToSupabase(supabaseOrder);
      
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
