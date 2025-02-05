import { FormField } from "../order-form/FormField";
import { stores } from "../order-form/formConfig";
import { casingGrades, tireSizes, scheduleOptions } from "./formConfig";
import type { MTOFormData } from "./types";

interface MTOFormFieldsProps {
  formData: MTOFormData;
  handleChange: (field: string, value: string) => void;
}

export const MTOFormFields = ({ formData, handleChange }: MTOFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        label="Store"
        value={formData.store}
        onChange={(value) => handleChange("store", value)}
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
        onChange={(value) => handleChange("name", value)}
        placeholder="Enter your name"
        required
      />

      <FormField
        label="Product Number"
        value={formData.productNumber}
        onChange={(value) => handleChange("productNumber", value)}
        placeholder="Enter product number"
        required
      />

      <FormField
        label="Casing Grade"
        value={formData.casingGrade}
        onChange={(value) => handleChange("casingGrade", value)}
        options={casingGrades}
        placeholder="Select casing grade"
        required
      />

      <FormField
        label="Tire Size"
        value={formData.tireSize}
        onChange={(value) => handleChange("tireSize", value)}
        options={tireSizes}
        placeholder="Select tire size"
        required
      />

      {formData.tireSize === 'custom' && (
        <FormField
          label="Custom Tire Size"
          value={formData.customTireSize}
          onChange={(value) => handleChange("customTireSize", value)}
          placeholder="Enter custom tire size"
          required
        />
      )}

      <FormField
        label="Tire Tread Needed"
        value={formData.tireTreadNeeded}
        onChange={(value) => handleChange("tireTreadNeeded", value)}
        placeholder="Enter tire tread needed"
        required
      />

      <FormField
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(value) => handleChange("quantity", value)}
        placeholder="Enter quantity"
        required
      />

      <FormField
        label="Schedule Arrival"
        value={formData.scheduleArrival}
        onChange={(value) => handleChange("scheduleArrival", value)}
        options={scheduleOptions}
        placeholder="Select arrival day"
        required
      />

      <FormField
        label="Notes"
        value={formData.notes}
        onChange={(value) => handleChange("notes", value)}
        placeholder="Enter any additional notes"
      />
    </div>
  );
};