
import { FormField } from "../../order-form/FormField";
import { stores, getStoreColor } from "../../order-form/formConfig";
import { WheelFormData } from "../types";
import { OrderingEmailField } from "@/components/common/OrderingEmailField";
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
      
      <div className="space-y-2">
        <FormField
          label="Store Location"
          value={formData.storeId || ""} // Empty by default
          onChange={onStoreChange}
          options={stores}
          placeholder="Please select your store location"
          disabled={false}
          required
        />
        <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded p-2">
          📍 <strong>Important:</strong> Please select the correct store location to ensure proper delivery and avoid submission errors.
        </div>
        {formData.storeName && formData.storeName !== formData.userStore && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
            ⚠️ <strong>Store Override:</strong> Selected store "{formData.storeName}" differs from your profile store "{formData.userStore}"
          </div>
        )}
      </div>

      {/* Plant Field removed - wheel forms now use plant selection from context */}

      {/* Store Colors Field - Editable with default from store */}
      <FormField
        label="Store Colors"
        value={formData.storeColors || storeColor || ""}
        onChange={(value) => onInputChange("storeColors", value)}
        options={[
          { id: "Yellow", name: "Yellow" },
          { id: "Red", name: "Red" },
          { id: "Blue", name: "Blue" },
          { id: "Green", name: "Green" },
          { id: "Orange", name: "Orange" },
          { id: "Purple", name: "Purple" },
          { id: "Black", name: "Black" },
          { id: "White", name: "White" }
        ]}
        placeholder="Select store color (defaults based on store)"
        disabled={false}
      />
      
      <OrderingEmailField
        value={managerEmail}
        onChange={(email) => onInputChange("managerEmail", email)}
        fallbackEmail={managerEmail}
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
