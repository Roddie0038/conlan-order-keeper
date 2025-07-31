
import React from "react";
import { Button } from "@/components/ui/button";
import { MTOFormFields } from "./MTOFormFields";
import { useMTOForm } from "./hooks/useMTOForm";
import { useSubmitMTOOrder } from "./hooks/useSubmitMTOOrder";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomFormPersistence } from "@/hooks/useCustomFormPersistence";
import { ClearFormButton } from "@/components/ui/clear-form-button";
import { FormRestorationBanner } from "@/components/ui/form-restoration-banner";
import { useMTOFormDebug } from "./hooks/useMTOFormDebug";
import { logger } from '@/utils/logger';

export const MTOOrderForm = () => {
  const { user } = useAuth();
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    resetForm,
    toast,
    isAdmin,
    setFormData,
    errors,
    setErrors
  } = useMTOForm();

  // Form persistence (only for non-admin users)
  const { lastSaved, isRestoring, clearPersistedData } = useCustomFormPersistence(
    formData,
    setFormData,
    {
      storageKey: 'ordering-platform-mto-form',
      excludeFields: ['timestamp', 'managerEmail'], // Exclude auto-generated fields
      enabled: !user?.isAdmin,
      debounceMs: 2000,
    }
  );
  
  React.useEffect(() => {
    if (user && user.store && !isAdmin) {
      setFormData(prev => ({ ...prev, store: user.store }));
    }
  }, [user, isAdmin, setFormData]);
  
  // Add debugging to track form data changes
  const { debuggedSubmitAction } = useMTOFormDebug(formData, () => {});
  
  const handleSubmit = useSubmitMTOOrder({
    formData,
    setIsSubmitting,
    resetForm,
    toast,
    errors,
    setErrors
  });
  
  const handleLoadTemplate = (templateData: any) => {
    setFormData({
      ...templateData,
      store: isAdmin ? templateData.store : user?.store || "",
      timestamp: new Date().toLocaleString()
    });
    clearPersistedData(); // Clear persistence when loading template
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };

  const handleClearForm = () => {
    resetForm();
    clearPersistedData();
  };
  
  return (
    <div className="space-y-4">
      {!user?.isAdmin && (
        <FormRestorationBanner isRestoring={isRestoring} lastSaved={lastSaved} />
      )}
      
      <Card className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex items-center">
          <img 
            src="/lovable-uploads/9936c75b-4159-4c84-88ee-829bdaaadb09.png" 
            alt="MTO Logo" 
            className="h-12 w-12 mr-4 object-contain" 
          />
          <h2 className="text-2xl font-semibold text-white">Order Templates</h2>
        </div>
        
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <OrderTemplate type="mto" currentData={formData} onLoadTemplate={handleLoadTemplate} />
            </div>
            {!user?.isAdmin && (
              <div className="ml-4">
                <ClearFormButton 
                  onClear={handleClearForm}
                  lastSaved={lastSaved}
                  disabled={isRestoring}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Store Info Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-l-4 border-blue-500 pl-3 py-1">
              <CheckCircle className="text-blue-500 h-5 w-5" />
              <h3 className="text-lg font-medium text-black">Store Information</h3>
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

          {/* Plant Selection Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-l-4 border-yellow-500 pl-3 py-1">
              <CheckCircle className="text-yellow-500 h-5 w-5" />
              <h3 className="text-lg font-medium text-black">Destination Plant</h3>
            </div>
            
            <div className="pl-5">
              <MTOFormFields 
                formData={formData} 
                onChange={handleChange} 
                isAdmin={isAdmin} 
                section="plant"
                plantError={errors.destinationPlant}
              />
            </div>
          </div>
          
          {/* Product Details Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2 border-l-4 border-green-500 pl-3 py-1">
              <CheckCircle className="text-green-500 h-5 w-5" />
              <h3 className="text-lg font-medium text-black">Product Details</h3>
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
              <h3 className="text-lg font-medium text-black">Order Specifications</h3>
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
            onClick={(e) => {
              e.preventDefault();
              logger.info("MTO form submit button clicked", {
                service: 'MTOOrderForm',
                formData: formData,
                idFields: Object.keys(formData).filter(key => key.toLowerCase().includes('id'))
              });
              handleSubmit(e);
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit MTO Order"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
