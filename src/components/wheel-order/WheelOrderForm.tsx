
import { Card, CardContent } from "@/components/ui/card";
import { WheelFormInputs } from "./WheelFormInputs";
import { FormHeader } from "./components/FormHeader";
import { FormFooter } from "./components/FormFooter";
import { useWheelOrderForm } from "./hooks/useWheelOrderForm";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { toast } from "@/hooks/use-toast";

import { ClearFormButton } from "@/components/ui/clear-form-button";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { FormRestorationBanner } from "@/components/ui/form-restoration-banner";
import { WheelEmailPreview } from "./components/EmailPreview";
import { useState, useEffect } from "react";
import { hasFullStoreAccess } from "@/lib/roles";
import StoreSelector from "@/components/common/StoreSelector";
import { ActingAsStoreBadge } from "@/components/common/ActingAsStoreBadge";
import { normalizeStoreName } from "@/lib/stores";

export function WheelOrderForm() {
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
    managerEmail,
    isSubmitting,
    user: hookUser,
    errors,
    handleInputChange,
    handleStoreChange,
    handleSubmit,
    setFormData,
    // Auto-save related
    lastSaved,
    isRestoring,
    clearPersistedData,
    ready,
    didRestore
  } = useWheelOrderForm();

  const [recipientCount, setRecipientCount] = useState(0);
  const { selectedPlant } = usePlant();

  // Auto-save now handled by the hook

  // Auto-initialize destination plant based on store
  useEffect(() => {
    if (!ready) return;
    if (didRestore) {
      console.log('[AutoSave][WheelOrderForm] Skipping auto-plant defaults – restored data present.');
      return;
    }
    const currentStore = formData.storeName;
    const currentPlant = formData.destinationPlant;
    
    // Only auto-set plant if not already set and we have a store
    if (currentStore && !currentPlant && selectedPlant) {
      console.log("🌱 WHEEL AUTO-PLANT - Setting destination plant", {
        store: currentStore,
        selectedPlant,
        currentPlant
      });
      
      setFormData(prev => ({
        ...prev,
        destinationPlant: selectedPlant
      }));
      
      console.log("✅ WHEEL AUTO-PLANT - Destination plant auto-set to:", selectedPlant);
    }
  }, [formData.storeName, selectedPlant, setFormData, ready, didRestore]);

  const handleLoadTemplate = (templateData: any) => {
    const newFormData = {
      ...templateData,
      dateReceived: new Date().toISOString().split("T")[0],
      destinationPlant: templateData.destinationPlant || "" // Keep template plant if set, otherwise clear
    };
    
    // Preserve auto-plant selection if template doesn't have destination plant
    if (!templateData.destinationPlant && selectedPlant) {
      console.log("🌱 WHEEL TEMPLATE LOAD - Preserving auto-selected plant:", selectedPlant);
      newFormData.destinationPlant = selectedPlant;
    }
    
    setFormData(newFormData);
    
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };

  const handleClearForm = () => {
    setFormData({
      yourName: "",
      storeName: "",
      storeId: "",
      dateReceived: new Date().toISOString().split("T")[0],
      qtyWheels: "",
      customerName: "",
      wheelMaterial: "",
      wheelType: "",
      handHoles: "",
      wheelSize: "",
      wheelColor: "",
      scheduleArrival: "",
      userStore: "",
      storeColors: "",
      destinationPlant: "",
      ordering_store: "",
      ordering_plant: "",
      destination_plant: "",
    });
    clearPersistedData();
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {!user?.isAdmin && (
        <FormRestorationBanner isRestoring={isRestoring} lastSaved={lastSaved} />
      )}
      
      <Card className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex items-center">
          <h2 className="text-2xl font-semibold text-white">Order Templates</h2>
        </div>
        
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <OrderTemplate 
                type="wheel" 
                currentData={formData} 
                onLoadTemplate={handleLoadTemplate} 
              />
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

        {/* Acting-As Store Section - For elevated users only */}
        {elevated && (
          <div className="p-6 border-b border-gray-100">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-black">Acting As (Source Store)</h3>
                <ActingAsStoreBadge orderingStore={formData.ordering_store} />
              </div>
              
              <StoreSelector
                label="Ordering as (Source Store)"
                value={formData.ordering_store || ''}
                onChange={(v) => {
                  const normalized = normalizeStoreName(v) || '';
                  setFormData(prev => ({ ...prev, ordering_store: normalized }));
                }}
                filterPlant={null}  // ignored for elevated users
                placeholder="Select source store..."
              />
            </div>
          </div>
        )}
      </Card>

      <Card className="bg-white shadow-xl transition-all duration-300 hover:shadow-2xl">
        <FormHeader />
        
        <form onSubmit={handleSubmit}>
          <CardContent className="p-8">
            <WheelFormInputs 
              formData={formData}
              managerEmail={managerEmail}
              onInputChange={handleInputChange}
              onStoreChange={handleStoreChange}
              user={hookUser}
              plantError={errors.destinationPlant}
            />

            {/* Email Recipients Preview */}
            {formData.storeName && (formData.destinationPlant || selectedPlant) && (
              <div className="mt-6">
                <WheelEmailPreview
                  formData={formData}
                  managerEmail={managerEmail}
                  className="w-full"
                  onRecipientsChange={setRecipientCount}
                />
              </div>
            )}
          </CardContent>
          
          <FormFooter isSubmitting={isSubmitting} recipientCount={recipientCount} />
        </form>
      </Card>
    </div>
  );
}
