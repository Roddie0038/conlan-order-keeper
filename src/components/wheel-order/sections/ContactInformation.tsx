
import { FormField } from "../../order-form/FormField";
import { stores } from "../../order-form/formConfig";
import { WheelFormData } from "../types";
import { getPlantForStore, extractStoreCode } from "@/utils/storeHelpers";
import { useOTStoreColors } from "@/integrations/ot-platform/hooks/useOTStores";
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
  // Fetch store colors from OT Platform
  const { data: storeColorsMap } = useOTStoreColors();
  
  // Calculate plant based on selected store (should come from OT in future)
  const plant = formData.storeName ? getPlantForStore(formData.storeName) : "";
  
  // Get store color from OT Platform
  const storeCode = formData.storeName ? extractStoreCode(formData.storeName) : null;
  const storeColorData = storeCode && storeColorsMap ? storeColorsMap.get(storeCode) : null;
  const storeColor = storeColorData?.color_name || "";
  const storeColorHex = storeColorData?.color_hex || "";

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
      
      {/* Store Select - Fixed to use storeId */}
      <div className="space-y-2">
        {!user?.isAdmin && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              🔒 LOCKED
            </span>
          </div>
        )}
        <FormField
          label="Store"
          value={formData.storeId}
          onChange={onStoreChange}
          options={stores}
          placeholder="Select store"
          disabled={!user?.isAdmin}
          required
        />
      </div>

      {/* Plant Field - Read-only, auto-fills based on store */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            🔒 LOCKED
          </span>
        </div>
        <FormField
          label="Plant"
          value={plant || ""}
          onChange={() => {}}
          disabled={true}
          placeholder="Plant will be automatically assigned"
        />
      </div>

      {/* Store Colors Field - From OT Platform */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            🔒 LOCKED
          </span>
        </div>
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
            placeholder="Store color from OT Platform"
            className="flex-1"
          />
        </div>
      </div>
      
      {/* REMOVED: Manager Email - OT Platform handles email routing */}
      
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
