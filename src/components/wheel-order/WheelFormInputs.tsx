
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
      </div>
      
      <OrderDetails 
        formData={formData}
        onInputChange={onInputChange}
      />
      
      <WheelSpecifications 
        formData={formData}
        onInputChange={onInputChange}
      />
    </div>
  );
}
