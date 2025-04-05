
import { Button } from "@/components/ui/button";
import { MTOFormFields } from "./MTOFormFields";
import { useMTOForm } from "./hooks/useMTOForm";
import { useSubmitMTOOrder } from "./hooks/useSubmitMTOOrder";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { Card } from "@/components/ui/card";

export const MTOOrderForm = () => {
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    resetForm,
    toast,
    isAdmin,
    setFormData
  } = useMTOForm();
  
  const handleSubmit = useSubmitMTOOrder({
    formData,
    setIsSubmitting,
    resetForm,
    toast
  });
  
  const handleLoadTemplate = (templateData: any) => {
    setFormData({
      ...templateData,
      timestamp: new Date().toLocaleString() // Always use current timestamp
    });
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };
  
  return (
    <Card className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Order Templates</h3>
        <OrderTemplate type="mto" currentData={formData} onLoadTemplate={handleLoadTemplate} />
      </div>
      
      <MTOFormFields formData={formData} onChange={handleChange} isAdmin={isAdmin} />

      <div className="mt-8">
        <Button 
          type="submit" 
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Submit MTO Order"}
        </Button>
      </div>
    </Card>
  );
};
