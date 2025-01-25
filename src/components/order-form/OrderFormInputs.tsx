import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { scheduleOptions, crossDockOptions, type FormData } from "./formConfig";

interface OrderFormInputsProps {
  formData: FormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof FormData, value: string) => void;
}

export const OrderFormInputs = ({
  formData,
  onSubmit,
  onChange,
}: OrderFormInputsProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <div className="space-y-4">
        <FormField
          label="Your Name"
          required
          value={formData.yourName}
          onChange={(value) => onChange("yourName", value)}
          placeholder="Enter your name"
        />

        <FormField
          label="Date Received"
          type="datetime-local"
          required
          value={formData.dateReceived}
          onChange={(value) => onChange("dateReceived", value)}
          disabled={true}
        />

        <FormField
          label="Product Number"
          required
          value={formData.productNumber}
          onChange={(value) => onChange("productNumber", value)}
          placeholder="Enter product number"
        />

        <FormField
          label="Description"
          required
          value={formData.description}
          onChange={(value) => onChange("description", value)}
          placeholder="Enter product description"
        />

        <FormField
          label="Quantity"
          type="number"
          required
          value={formData.quantity}
          onChange={(value) => onChange("quantity", value)}
          placeholder="Enter quantity"
        />

        <FormField
          label="Schedule Arrival"
          value={formData.scheduleArrival}
          onChange={(value) => onChange("scheduleArrival", value)}
          options={scheduleOptions}
          placeholder="Select arrival day"
        />

        <FormField
          label="Notes"
          value={formData.notes}
          onChange={(value) => onChange("notes", value)}
          placeholder="Enter any additional notes"
        />

        <FormField
          label="Cross Dock"
          value={formData.crossDock}
          onChange={(value) => onChange("crossDock", value)}
          options={crossDockOptions}
          placeholder="Select yes/no"
        />
      </div>

      <Button type="submit" className="w-full">
        Add to Summary
      </Button>
    </form>
  );
};