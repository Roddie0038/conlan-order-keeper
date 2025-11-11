
import { FormField } from "../../order-form/FormField";
import { stores } from "../../order-form/formConfig";
import { WheelFormData } from "../types";
import { getPlantForStore } from "@/utils/plantMapping";
import { getStoreColorName, getStoreColorHex } from "@/utils/storeColorMapping";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
  
  // Calculate store color based on selected store (matches OT's mapping)
  const storeColor = formData.storeName ? getStoreColorName(formData.storeName) : "";
  const storeColorHex = formData.storeName ? getStoreColorHex(formData.storeName) : "";

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

      {/* Store Colors Field - Read-only, auto-fills based on store with color chip */}
      <div className="space-y-2">
        <Label htmlFor="storeColor">Store Color</Label>
        <div className="flex items-center gap-2">
          {storeColorHex && (
            <div 
              className="w-8 h-8 rounded-md border-2 border-border shadow-sm flex-shrink-0"
              style={{ backgroundColor: storeColorHex }}
              title={storeColor}
            />
          )}
          <Input
            id="storeColor"
            value={storeColor || ""}
            disabled={true}
            placeholder="Store color will be automatically assigned"
            className="flex-1"
          />
        </div>
      </div>
      
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
