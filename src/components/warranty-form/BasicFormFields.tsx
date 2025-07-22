
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MandatoryPlantSelector } from "@/components/ui/mandatory-plant-selector";
import { RetreadWarrantyFormData } from "@/hooks/useRetreadWarrantyForm";

interface BasicFormFieldsProps {
  form: RetreadWarrantyFormData;
  onChange: (field: keyof RetreadWarrantyFormData, value: string) => void;
  errors?: Record<string, string>;
}

export function BasicFormFields({ form, onChange, errors = {} }: BasicFormFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Plant Selector */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
          🎯 Destination Plant
        </h3>
        <MandatoryPlantSelector
          value={form.destinationPlant}
          onChange={(value) => onChange("destinationPlant", value)}
          error={errors.destinationPlant}
        />
      </div>

      {/* Basic Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dotNumber" className="text-sm font-medium">
            DOT Number *
          </Label>
          <Input
            id="dotNumber"
            value={form.dotNumber}
            onChange={(e) => onChange("dotNumber", e.target.value)}
            placeholder="Enter DOT number"
            className={errors.dotNumber ? "border-red-500" : ""}
            required
          />
          {errors.dotNumber && <p className="text-sm text-red-500">{errors.dotNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerName" className="text-sm font-medium">
            Customer Name *
          </Label>
          <Input
            id="customerName"
            value={form.customerName}
            onChange={(e) => onChange("customerName", e.target.value)}
            placeholder="Enter customer name"
            className={errors.customerName ? "border-red-500" : ""}
            required
          />
          {errors.customerName && <p className="text-sm text-red-500">{errors.customerName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="workOrder" className="text-sm font-medium">
            Work Order *
          </Label>
          <Input
            id="workOrder"
            value={form.workOrder}
            onChange={(e) => onChange("workOrder", e.target.value)}
            placeholder="Enter work order number"
            className={errors.workOrder ? "border-red-500" : ""}
            required
          />
          {errors.workOrder && <p className="text-sm text-red-500">{errors.workOrder}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tireSize" className="text-sm font-medium">
            Tire Size *
          </Label>
          <Input
            id="tireSize"
            value={form.tireSize}
            onChange={(e) => onChange("tireSize", e.target.value)}
            placeholder="Enter tire size"
            className={errors.tireSize ? "border-red-500" : ""}
            required
          />
          {errors.tireSize && <p className="text-sm text-red-500">{errors.tireSize}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="condition" className="text-sm font-medium">
          Condition *
        </Label>
        <Select value={form.condition} onValueChange={(value) => onChange("condition", value)}>
          <SelectTrigger className={errors.condition ? "border-red-500" : ""}>
            <SelectValue placeholder="Select condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tire Separation">Tire Separation</SelectItem>
            <SelectItem value="Irregular Wear">Irregular Wear</SelectItem>
            <SelectItem value="Sidewall Damage">Sidewall Damage</SelectItem>
            <SelectItem value="Tread Damage">Tread Damage</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.condition && <p className="text-sm text-red-500">{errors.condition}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-sm font-medium">
          Notes
        </Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Additional notes or details..."
          rows={4}
        />
      </div>
    </div>
  );
}
