
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface NationalFormFieldsProps {
  dotNumber: string;
  tireSize: string;
  loadRange: string;
  wearPercentage: string;
  mileageOnTire: string;
  reasonForAdjustment: string;
  exciseTaxCollected: boolean;
  replacementProductCode: string;
  notes: string;
  onFieldChange: (field: string, value: string | boolean) => void;
}

export function NationalFormFields({
  dotNumber,
  tireSize,
  loadRange,
  wearPercentage,
  mileageOnTire,
  reasonForAdjustment,
  exciseTaxCollected,
  replacementProductCode,
  notes,
  onFieldChange
}: NationalFormFieldsProps) {
  return (
    <>
      {/* DOT Number */}
      <div>
        <Label htmlFor="dotNumber">DOT Number *</Label>
        <Input
          id="dotNumber"
          value={dotNumber}
          onChange={(e) => onFieldChange("dotNumber", e.target.value)}
          placeholder="Department of Transportation number"
          required
        />
      </div>

      {/* Tire Size */}
      <div>
        <Label htmlFor="tireSize">Tire Size *</Label>
        <Input
          id="tireSize"
          value={tireSize}
          onChange={(e) => onFieldChange("tireSize", e.target.value)}
          placeholder="e.g., 295/75R22.5"
          required
        />
      </div>

      {/* Load Range */}
      <div>
        <Label htmlFor="loadRange">Load Range *</Label>
        <Input
          id="loadRange"
          value={loadRange}
          onChange={(e) => onFieldChange("loadRange", e.target.value)}
          placeholder="e.g., G, H, J"
          required
        />
      </div>

      {/* % Wear or Tread Depth */}
      <div>
        <Label htmlFor="wearPercentage">% Wear or Tread Depth *</Label>
        <Input
          id="wearPercentage"
          value={wearPercentage}
          onChange={(e) => onFieldChange("wearPercentage", e.target.value)}
          placeholder="e.g., 50% or 8/32"
          required
        />
      </div>

      {/* Mileage on Tire */}
      <div>
        <Label htmlFor="mileageOnTire">Mileage on Tire *</Label>
        <Input
          id="mileageOnTire"
          value={mileageOnTire}
          onChange={(e) => onFieldChange("mileageOnTire", e.target.value)}
          placeholder="Total miles on this tire"
          required
        />
      </div>

      {/* Reason for Adjustment */}
      <div>
        <Label htmlFor="reasonForAdjustment">Reason for Adjustment *</Label>
        <Textarea
          id="reasonForAdjustment"
          value={reasonForAdjustment}
          onChange={(e) => onFieldChange("reasonForAdjustment", e.target.value)}
          placeholder="Describe the issue requiring warranty adjustment"
          required
        />
      </div>

      {/* Excise Tax Collected */}
      <div>
        <Label className="text-base font-medium">Excise Tax Collected? *</Label>
        <RadioGroup
          value={exciseTaxCollected ? "yes" : "no"}
          onValueChange={(value) => onFieldChange("exciseTaxCollected", value === "yes")}
          className="flex flex-row space-x-6 mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="excise-yes" />
            <Label htmlFor="excise-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="excise-no" />
            <Label htmlFor="excise-no">No</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Replacement Tire Product Code (Optional) */}
      <div>
        <Label htmlFor="replacementProductCode">Replacement Tire Product Code</Label>
        <Input
          id="replacementProductCode"
          value={replacementProductCode}
          onChange={(e) => onFieldChange("replacementProductCode", e.target.value)}
          placeholder="Optional replacement product code"
        />
      </div>

      {/* Notes (Optional) */}
      <div>
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => onFieldChange("notes", e.target.value)}
          placeholder="Any additional information about this warranty claim"
        />
      </div>
    </>
  );
}
