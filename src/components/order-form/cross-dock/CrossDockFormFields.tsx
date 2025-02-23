
import { FormField } from "../FormField";
import { stores } from "../formConfig";
import { CrossDockPaperworkData } from "./types";

interface CrossDockFormFieldsProps {
  formData: CrossDockPaperworkData;
  onChange: (field: keyof CrossDockPaperworkData, value: string) => void;
}

export const CrossDockFormFields = ({ formData, onChange }: CrossDockFormFieldsProps) => {
  return (
    <>
      <FormField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(value) => onChange("date", value)}
        required
      />
      
      <FormField
        label="From Store"
        value={formData.fromStore}
        onChange={(value) => onChange("fromStore", value)}
        options={stores}
        required
      />
      
      <FormField
        label="To Store"
        value={formData.toStore}
        onChange={(value) => onChange("toStore", value)}
        options={stores}
        required
      />
      
      <FormField
        label="Receiver No (MaddenCo)"
        type="text"
        value={formData.receiverNo}
        onChange={(value) => onChange("receiverNo", value)}
        required
      />
      
      <FormField
        label="Product Code"
        type="text"
        value={formData.productCode}
        onChange={(value) => onChange("productCode", value)}
        required
      />
      
      <FormField
        label="Description"
        type="text"
        value={formData.description}
        onChange={(value) => onChange("description", value)}
        required
      />
      
      <FormField
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(value) => onChange("quantity", value)}
        required
      />
    </>
  );
};
