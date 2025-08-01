
import { FormField } from "../../order-form/FormField";
import { stores, getStoreColor } from "../../order-form/formConfig";
import { WheelFormData } from "../types";
// Plant selection logic removed - now handled by form-level selectors

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
  // Plant display logic removed - forms now use dedicated plant selectors
  
  // Calculate store color based on selected store
  const storeColor = formData.storeName ? getStoreColor(formData.storeName) : "";

  // Enhanced logging for debugging store issues
  console.log("🏪 WHEEL POWDER COATING - ContactInformation render:", {
    formDataStoreName: formData.storeName,
    formDataStoreId: formData.storeId,
    userStore: user?.store,
    userIsAdmin: user?.isAdmin,
    storeColor,
    managerEmail
  });

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
      
      {/* TEMPORARY FIX: Make store dropdown always editable with warning for non-admins */}
      <div className="space-y-2">
        <FormField
          label="Store"
          value={formData.storeId} // Use storeId for selection to match dropdown values
          onChange={onStoreChange}
          options={stores}
          placeholder="Select store"
          disabled={false} // ✅ TEMPORARY FIX: Always editable
          required
        />
        {!user?.isAdmin && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
            ⚠️ <strong>Temporary Fix Active:</strong> If your store shows incorrectly, please select the correct store manually. This will be fixed permanently soon.
          </div>
        )}
        {formData.storeName && formData.storeName !== formData.userStore && (
          <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded p-2">
            📍 <strong>Store Override:</strong> Selected store "{formData.storeName}" differs from your profile store "{formData.userStore}"
          </div>
        )}
      </div>

      {/* Plant Field removed - wheel forms now use plant selection from context */}

      {/* Store Colors Field - Read-only, auto-fills based on store */}
      <FormField
        label="Store Colors"
        value={storeColor || ""}
        onChange={() => {}}
        disabled={true}
        placeholder="Store color will be automatically assigned"
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
