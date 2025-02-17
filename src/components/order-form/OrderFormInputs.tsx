import { FormField } from "./FormField";
import { Button } from "@/components/ui/button";
import { scheduleOptions, crossDockOptions, stores, type FormData, storeManagerEmails } from "./formConfig";
interface OrderFormInputsProps {
  formData: FormData;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (field: keyof FormData, value: string) => void;
}
export const OrderFormInputs = ({
  formData,
  onSubmit,
  onChange
}: OrderFormInputsProps) => {
  return <form onSubmit={onSubmit} className="space-y-6 max-w-2xl mx-auto p-6 shadow bg-blue-300 hover:bg-blue-200 rounded-3xl">
      <div className="space-y-4">
        <FormField label="Your Name" required value={formData.yourName} onChange={value => onChange("yourName", value)} placeholder="Enter your name" />

        <FormField label="Date Received" type="datetime-local" required value={formData.dateReceived} onChange={value => onChange("dateReceived", value)} disabled={true} />

        <FormField label="Manager's Email" type="email" value={formData.managersEmail || ''} onChange={() => {}} // No-op since it's read-only
      disabled={true} placeholder="Manager's email will be automatically set" />

        <FormField label="Product Number" required value={formData.productNumber} onChange={value => onChange("productNumber", value)} placeholder="Enter product number" />

        <FormField label="Description" required value={formData.description} onChange={value => onChange("description", value)} placeholder="Enter product description" />

        <FormField label="Quantity" type="number" required value={formData.quantity} onChange={value => onChange("quantity", value)} placeholder="Enter quantity" />

        <FormField label="Schedule Arrival" value={formData.scheduleArrival} onChange={value => onChange("scheduleArrival", value)} options={scheduleOptions} placeholder="Select arrival day" />

        <FormField label="Notes" value={formData.notes} onChange={value => onChange("notes", value)} placeholder="Enter any additional notes" />

        <FormField label="Cross Dock" value={formData.crossDock} onChange={value => onChange("crossDock", value)} options={crossDockOptions} placeholder="Select yes/no" />

        {formData.crossDock === "yes" && <FormField label="Cross Dock Destination" value={formData.crossDockDestination || ""} onChange={value => {
        onChange("crossDockDestination", value);
        // Set manager email based on selected store ID
        const managersEmail = storeManagerEmails[value] || '';
        onChange("managersEmail", managersEmail);
      }} options={stores} placeholder="Select destination" required />}
      </div>

      <Button type="submit" className="w-full text-slate-50 rounded-3xl bg-rose-600 hover:bg-rose-500">ADD TO ORDER</Button>
    </form>;
};