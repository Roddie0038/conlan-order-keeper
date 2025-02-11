
import { FormField } from "../order-form/FormField";
import { stores } from "../order-form/formConfig";
import { casingGrades, tireSizes, scheduleOptions, MTOFormData } from "./mto-form-config";

interface MTOFormFieldsProps {
  formData: MTOFormData;
  onChange: (field: string, value: string) => void;
}

export const MTOFormFields = ({ formData, onChange }: MTOFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        label="Store"
        value={formData.store}
        onChange={(value) => onChange("store", value)}
        options={stores}
        placeholder="Select store"
        required
      />

      <FormField
        label="Timestamp"
        value={formData.timestamp}
        onChange={() => {}}
        disabled={true}
      />

      <FormField
        label="Name"
        value={formData.name}
        onChange={(value) => onChange("name", value)}
        placeholder="Enter your name"
        required
      />

      <FormField
        label="Product Number"
        value={formData.productNumber}
        onChange={(value) => onChange("productNumber", value)}
        placeholder="Enter product number"
        required
      />

      <FormField
        label="Casing Grade"
        value={formData.casingGrade}
        onChange={(value) => onChange("casingGrade", value)}
        options={casingGrades}
        placeholder="Select casing grade"
        required
      />

      <FormField
        label="Tire Size"
        value={formData.tireSize}
        onChange={(value) => onChange("tireSize", value)}
        options={tireSizes}
        placeholder="Select tire size"
        required
      />

      {formData.tireSize === 'custom' && (
        <FormField
          label="Custom Tire Size"
          value={formData.customTireSize}
          onChange={(value) => onChange("customTireSize", value)}
          placeholder="Enter custom tire size"
          required
        />
      )}

      <FormField
        label="Tire Tread Needed"
        value={formData.tireTreadNeeded}
        onChange={(value) => onChange("tireTreadNeeded", value)}
        placeholder="Enter tire tread needed"
        required
      />

      <FormField
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(value) => onChange("quantity", value)}
        placeholder="Enter quantity"
        required
      />

      <FormField
        label="Schedule Arrival"
        value={formData.scheduleArrival}
        onChange={(value) => onChange("scheduleArrival", value)}
        options={scheduleOptions}
        placeholder="Select arrival day"
        required
      />

      <FormField
        label="Notes"
        value={formData.notes}
        onChange={(value) => onChange("notes", value)}
        placeholder="Enter any additional notes"
      />
    </div>
  );
};
