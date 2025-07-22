
import { WheelFormData } from "./types";
import { ContactInformation } from "./sections/ContactInformation";
import { OrderDetails } from "./sections/OrderDetails";
import { WheelSpecifications } from "./sections/WheelSpecifications";
import { MandatoryPlantSelector } from "@/components/ui/mandatory-plant-selector";

interface WheelFormInputsProps {
  formData: WheelFormData;
  managerEmail: string;
  onInputChange: (name: string, value: string) => void;
  onStoreChange: (value: string) => void;
  user: any;
  plantError?: string;
}

export function WheelFormInputs({ 
  formData, 
  managerEmail, 
  onInputChange, 
  onStoreChange, 
  user,
  plantError
}: WheelFormInputsProps) {
  // Helper function to check if a field is missing for visual feedback
  const isFieldMissing = (fieldName: keyof WheelFormData): boolean => {
    const value = formData[fieldName];
    return !value || (typeof value === 'string' && value.trim() === '');
  };

  return (
    <div className="space-y-8">
      <ContactInformation 
        formData={formData}
        managerEmail={managerEmail}
        onInputChange={onInputChange}
        onStoreChange={onStoreChange}
        user={user}
      />

      {/* Mandatory Plant Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          🎯 Destination Plant
        </h3>
        <MandatoryPlantSelector
          value={formData.destinationPlant || ""}
          onChange={(value) => onInputChange("destinationPlant", value)}
          error={plantError}
        />
        {!formData.destinationPlant && (
          <p className="text-sm text-red-600 mt-1">⚠️ Please select a destination plant</p>
        )}
      </div>
      
      <OrderDetails 
        formData={formData}
        onInputChange={onInputChange}
      />
      
      <WheelSpecifications 
        formData={formData}
        onInputChange={onInputChange}
      />

      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-gray-600">
          <strong>Debug Info:</strong>
          <br />Store ID: {formData.storeId || 'MISSING'}
          <br />Store Name: {formData.storeName || 'MISSING'}
          <br />User Store: {formData.userStore || 'MISSING'}
          <br />Destination Plant: {formData.destinationPlant || 'MISSING'}
        </div>
      )}
    </div>
  );
}
