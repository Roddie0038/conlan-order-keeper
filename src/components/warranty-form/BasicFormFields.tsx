
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface BasicFormFieldsProps {
  form: {
    customerName: string;
    workOrder: string;
    dotNumber: string;
    tireSize: string;
    condition: string;
    notes: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function BasicFormFields({ form, onChange }: BasicFormFieldsProps) {
  const { user } = useAuth();

  return (
    <>
      {/* Store Location - Auto-filled */}
      <div>
        <Label htmlFor="storeLocation">Store Location</Label>
        <Input 
          id="storeLocation"
          value={user?.storeName || "Not specified"}
          disabled 
          className="bg-gray-50"
        />
      </div>

      {/* Customer Name */}
      <div>
        <Label htmlFor="customerName">Customer Name *</Label>
        <Input
          id="customerName"
          name="customerName"
          value={form.customerName}
          onChange={onChange}
          placeholder="Enter customer name"
          required
        />
      </div>

      {/* Work Order */}
      <div>
        <Label htmlFor="workOrder">Retread Work Order # *</Label>
        <Input
          id="workOrder"
          name="workOrder"
          value={form.workOrder}
          onChange={onChange}
          placeholder="Enter work order number"
          required
        />
      </div>

      {/* DOT Number */}
      <div>
        <Label htmlFor="dotNumber">DOT Number *</Label>
        <Input
          id="dotNumber"
          name="dotNumber"
          value={form.dotNumber}
          onChange={onChange}
          placeholder="Enter DOT number"
          required
        />
      </div>

      {/* Tire Size */}
      <div>
        <Label htmlFor="tireSize">Tire Size</Label>
        <Input
          id="tireSize"
          name="tireSize"
          value={form.tireSize}
          onChange={onChange}
          placeholder="Enter tire size (optional)"
        />
      </div>

      {/* Condition */}
      <div>
        <Label htmlFor="condition">Tire Condition / Reason for Adjustment *</Label>
        <Textarea
          id="condition"
          name="condition"
          value={form.condition}
          onChange={onChange}
          placeholder="Describe the tire condition and reason for warranty claim"
          rows={3}
          required
        />
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={onChange}
          placeholder="Any additional information (optional)"
          rows={2}
        />
      </div>
    </>
  );
}
