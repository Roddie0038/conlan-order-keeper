
import { Button } from "@/components/ui/button";
import { MTOFormFields } from "./MTOFormFields";
import { useMTOForm } from "./hooks/useMTOForm";
import { useSubmitMTOOrder } from "./hooks/useSubmitMTOOrder";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

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
    <Card className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
      {/* Colored Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex items-center">
        <img 
          src="/lovable-uploads/9936c75b-4159-4c84-88ee-829bdaaadb09.png" 
          alt="MTO Logo" 
          className="h-12 w-12 mr-4 object-contain" 
        />
        <h2 className="text-2xl font-semibold text-white">Order Templates</h2>
      </div>
      
      <div className="p-6 border-b border-gray-100">
        <OrderTemplate type="mto" currentData={formData} onLoadTemplate={handleLoadTemplate} />
      </div>
      
      {/* Form Content with Section Headers */}
      <div className="p-6 space-y-8">
        {/* Store Info Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-l-4 border-blue-500 pl-3 py-1">
            <CheckCircle className="text-blue-500 h-5 w-5" />
            <h3 className="text-lg font-medium text-gray-700">Store Information</h3>
          </div>
          
          <div className="pl-5">
            <MTOFormFields 
              formData={formData} 
              onChange={handleChange} 
              isAdmin={isAdmin} 
              section="store" 
            />
          </div>
        </div>
        
        {/* Product Details Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-l-4 border-green-500 pl-3 py-1">
            <CheckCircle className="text-green-500 h-5 w-5" />
            <h3 className="text-lg font-medium text-gray-700">Product Details</h3>
          </div>
          
          <div className="pl-5">
            <MTOFormFields 
              formData={formData} 
              onChange={handleChange} 
              isAdmin={isAdmin} 
              section="product" 
            />
          </div>
        </div>
        
        {/* Order Specifications Section */}
        <div className="space-y-6">
          <div className="flex items-center space-x-2 border-l-4 border-orange-500 pl-3 py-1">
            <CheckCircle className="text-orange-500 h-5 w-5" />
            <h3 className="text-lg font-medium text-gray-700">Order Specifications</h3>
          </div>
          
          <div className="pl-5">
            <MTOFormFields 
              formData={formData} 
              onChange={handleChange} 
              isAdmin={isAdmin} 
              section="order" 
            />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Button 
          type="submit" 
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-md transition-all duration-200 hover:shadow-md hover:scale-[1.01] flex items-center justify-center"
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Submit MTO Order"}
        </Button>
      </div>
    </Card>
  );
};
