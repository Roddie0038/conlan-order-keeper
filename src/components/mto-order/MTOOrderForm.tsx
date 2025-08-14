
import React from "react";
import { Button } from "@/components/ui/button";
import { MTOFormFields } from "./MTOFormFields";
import { useMTOForm } from "./hooks/useMTOForm";
import { useSubmitMTOOrder } from "./hooks/useSubmitMTOOrder";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useStatefulFormAutosave } from "@/hooks/useFormAutosave";
import { ClearFormButton } from "@/components/ui/clear-form-button";
import { FormRestorationBanner } from "@/components/ui/form-restoration-banner";
import { useMTOFormDebug } from "./hooks/useMTOFormDebug";
import { logger } from '@/utils/logger';
import { EmailRecipientsPreview } from "@/components/shared/EmailRecipientsPreview";
import { useState } from "react";
import { CrossPlantSection } from "@/components/orders/CrossPlantSection";
import OrderSummaryPreview from "@/components/orders/OrderSummaryPreview";
import ConfirmSamePlantModal from "@/components/common/ConfirmSamePlantModal";
import { hasFullStoreAccess } from "@/lib/roles";
import StoreSelector from "@/components/common/StoreSelector";
import { ActingAsStoreBadge } from "@/components/common/ActingAsStoreBadge";
import { normalizeStoreName } from "@/lib/stores";
import { TransferFieldsSection } from "@/components/common/forms/TransferFieldsSection";
import { type TransferRoute, type Carrier } from "@/types/orders";

export const MTOOrderForm = () => {
  const { user } = useAuth();
  const elevated = hasFullStoreAccess(user);

  // Add temporary debug log for triage
  console.info('[Ordering Acting-As]', {
    userEmail: user?.email,
    userRole: user?.role,
    elevated: elevated,
  });
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

  const [recipientCount, setRecipientCount] = useState(0);
  const [needSamePlantConfirm, setNeedSamePlantConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<(() => Promise<void>) | null>(null);
  const { selectedPlant } = usePlant();

  // Enhanced form persistence (only for non-admin users)
  const { lastSaved, isRestoring, clearPersistedData, saveCount, ready, didRestore } = useStatefulFormAutosave(
    formData,
    setFormData,
    'mto',
    {
      excludeFields: ['timestamp', 'managerEmail', 'password', 'file'], // Enhanced exclusion
      enabled: !user?.isAdmin,
    }
  );
  
  React.useEffect(() => {
    if (!ready) {
      console.log('[AutoSave] Defaults not applied – persistence not ready');
      return;
    }
    if (didRestore) {
      console.log('[AutoSave] Skipping defaults – restored data present.');
      return;
    }
    if (user && user.store && !isAdmin && !user.hasFullStoreAccess) {
      setFormData(prev => (prev.store ? prev : { ...prev, store: user.store }));
    }
  }, [user, isAdmin, setFormData, ready, didRestore]);
  
  // Add debugging to track form data changes
  const { debuggedSubmitAction } = useMTOFormDebug(formData, () => {});

  // Auto-initialize destination plant based on store
  React.useEffect(() => {
    if (!ready) return;
    if (didRestore) {
      console.log('[AutoSave][MTOOrderForm] Skipping auto-plant defaults – restored data present.');
      return;
    }
    console.log('[AutoSave][MTOOrderForm] auto-plant defaults effect', { ready, didRestore });
    const currentStore = formData.store;
    const currentPlant = formData.destinationPlant;
    
    // Only auto-set plant if not already set and we have a store
    if (currentStore && !currentPlant && selectedPlant) {
      console.log("🌱 MTO AUTO-PLANT - Setting destination plant", {
        store: currentStore,
        selectedPlant,
        currentPlant
      });
      
      setFormData(prev => ({
        ...prev,
        destinationPlant: selectedPlant
      }));
      
      console.log("✅ MTO AUTO-PLANT - Destination plant auto-set to:", selectedPlant);
    }
  }, [formData.store, selectedPlant, setFormData, ready, didRestore]);
  
  const handleSubmit = useSubmitMTOOrder({
    formData,
    setIsSubmitting,
    resetForm,
    toast,
    errors,
    setErrors
  });
  
  const handleLoadTemplate = (templateData: any) => {
    const newFormData = {
      ...templateData,
      store: (isAdmin || user?.hasFullStoreAccess) ? templateData.store : user?.store || "",
      timestamp: new Date().toLocaleString()
    };
    
    // Preserve auto-plant selection if template doesn't have destination plant
    if (!templateData.destinationPlant && selectedPlant) {
      console.log("🌱 MTO TEMPLATE LOAD - Preserving auto-selected plant:", selectedPlant);
      newFormData.destinationPlant = selectedPlant;
    }
    
    setFormData(newFormData);
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
        <FormRestorationBanner 
          isRestoring={isRestoring} 
          lastSaved={lastSaved}
          onClearData={clearPersistedData}
          saveCount={saveCount}
        />
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
          {/* Acting-As Store Section - For elevated users only */}
          {elevated && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 border-l-4 border-purple-500 pl-3 py-1">
                  <CheckCircle className="text-purple-500 h-5 w-5" />
                  <h3 className="text-lg font-medium text-black">Acting As (Source Store)</h3>
                </div>
                <ActingAsStoreBadge orderingStore={formData.ordering_store} />
              </div>
              
              <div className="pl-5">
                <StoreSelector
                  label="Ordering as (Source Store)"
                  value={formData.ordering_store || ''}
                  onChange={(v) => {
                    const normalized = normalizeStoreName(v) || '';
                    setFormData(prev => ({ ...prev, ordering_store: normalized }));
                  }}
                  filterPlant={null}  // ignored for elevated users
                  placeholder="Select source store..."
                  allowUnassigned={true}  // Acting-As selector allows unassigned
                />
              </div>
            </div>
          )}

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

          {/* Transfer & Shipping Details Section */}
          <div className="space-y-6">
            <TransferFieldsSection
              transferRoute={formData.transfer_route}
              carrier={formData.carrier}
              arrivalDate={formData.arrival_date}
              onTransferRouteChange={(value: TransferRoute) => 
                setFormData(prev => ({ ...prev, transfer_route: value }))
              }
              onCarrierChange={(value) => 
                setFormData(prev => ({ ...prev, carrier: value }))
              }
              onArrivalDateChange={(value: string) => 
                setFormData(prev => ({ ...prev, arrival_date: value }))
              }
            />
          </div>
        </div>

        {/* Cross-Plant Ordering - For elevated users only */}
        {elevated && (
          <div className="px-6 pb-4">
            <CrossPlantSection
              enabled={elevated}
              value={{
                ordering_store: formData.ordering_store || null,
                ordering_plant: formData.ordering_plant || null,
                destination_plant: formData.destination_plant || null,
              }}
              onChange={(crossPlantData) => {
                setFormData({
                  ...formData,
                  ordering_store: crossPlantData.ordering_store || "",
                  ordering_plant: crossPlantData.ordering_plant || "",
                  destination_plant: crossPlantData.destination_plant || "",
                });
              }}
            />
          </div>
        )}

        {/* Order Summary Preview - For elevated users only */}
        {elevated && (
          <div className="px-6 pb-4">
            <OrderSummaryPreview
              enabled={elevated}
              cross={{
                ordering_store: formData.ordering_store || null,
                ordering_plant: formData.ordering_plant || null,
                destination_plant: formData.destination_plant || null,
              }}
              legacy={{
                store: formData.store || "",
                plant: formData.destinationPlant || selectedPlant || "",
              }}
            />
          </div>
        )}

        {/* Email Recipients Preview */}
        {formData.store && (formData.destinationPlant || selectedPlant) && (
          <div className="px-6 pb-4">
            <EmailRecipientsPreview
              store={formData.store}
              plant={formData.destinationPlant || selectedPlant}
              emailType="mto"
              orderData={{
                manager_email: formData.managerEmail
              }}
              className="w-full"
              onRecipientsChange={setRecipientCount}
            />
          </div>
        )}

        <div className="px-6 pb-6">
          <Button 
            type="submit" 
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-md transition-all duration-200 hover:shadow-md hover:scale-[1.01] flex items-center justify-center"
            disabled={isSubmitting || recipientCount === 0}
            onClick={(e) => {
              e.preventDefault();
              logger.info("MTO form submit button clicked", {
                service: 'MTOOrderForm',
                formData: formData,
                idFields: Object.keys(formData).filter(key => key.toLowerCase().includes('id'))
              });
              
              // Check if same-plant confirmation is needed
              const requiresSamePlantConfirm = () => {
                const orderingPlant = formData.ordering_plant;
                const destinationPlant = formData.destination_plant;
                return elevated && orderingPlant && destinationPlant && (orderingPlant === destinationPlant);
              };

              if (requiresSamePlantConfirm()) {
                setPendingSubmit(() => async () => handleSubmit(e));
                setNeedSamePlantConfirm(true);
                return;
              }
              
              handleSubmit(e);
            }}
          >
            {isSubmitting ? "Submitting..." : recipientCount === 0 ? "Add Recipients to Submit" : "Submit MTO Order"}
          </Button>
        </div>
      </Card>

      {/* Same-Plant Confirmation Modal */}
      <ConfirmSamePlantModal
        open={needSamePlantConfirm}
        source={formData.ordering_plant}
        destination={formData.destination_plant}
        onCancel={() => { 
          setNeedSamePlantConfirm(false); 
          setPendingSubmit(null); 
        }}
        onConfirm={async () => { 
          setNeedSamePlantConfirm(false); 
          if (pendingSubmit) {
            await pendingSubmit();
          }
          setPendingSubmit(null);
        }}
      />
    </div>
  );
};
