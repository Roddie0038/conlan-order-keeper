
import { FormField } from "../../order-form/FormField";
import { stores } from "../../order-form/formConfig";
import { WheelFormData } from "../types";
import { getPlantForStore } from "@/utils/plantMapping";

interface ContactInformationProps {
  formData: WheelFormData;
  managerEmail: string;
  onInputChange: (name: string, value: string) => void;
  onStoreChange: (value: string) => void;
  user: any;
}

export function ContactInformation({ 
  formData, 
  managerEmail, 
  onInputChange, 
  onStoreChange, 
  user 
}: ContactInformationProps) {
  // Calculate plant based on selected store
  const plant = formData.storeName ? getPlantForStore(formData.storeName) : "";

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
        Contact Information
      </h3>
      
      <FormField
        label="Your Name"
        value={formData.yourName}
        onChange={(value) => onInputChange("yourName", value)}
        placeholder="Enter your name"
        required
      />
      
      <FormField
        label="Store"
        value={formData.storeName}
        onChange={onStoreChange}
        options={stores}
        placeholder="Select store"
        disabled={!user?.isAdmin}
        required
      />

      {/* Plant Field - Read-only, auto-fills based on store */}
      <FormField
        label="Plant"
        value={plant || ""}
        onChange={() => {}}
        disabled={true}
        placeholder="Plant will be automatically assigned"
      />
      
      <FormField
        label="Manager's Email"
        type="email"
        value={managerEmail}
        onChange={() => {}}
        disabled={true}
        placeholder="Manager's email will be automatically set"
      />
      
      <FormField
        label="Date Received"
        type="date"
        value={formData.dateReceived}
        onChange={(value) => onInputChange("dateReceived", value)}
        required
      />
    </div>
  );
}
