
import { FormField } from "../order-form/FormField";
import { stores } from "../order-form/formConfig";
import { casingGrades, tireSizes, scheduleOptions, MTOFormData } from "./mto-form-config";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface MTOFormFieldsProps {
  formData: MTOFormData;
  onChange: (field: string, value: string | string[]) => void;
  isAdmin?: boolean;
}

export const MTOFormFields = ({
  formData,
  onChange,
  isAdmin = false
}: MTOFormFieldsProps) => {
  const handleCasingGradeChange = (grade: string, checked: boolean) => {
    const updatedGrades = checked ? [...formData.casingGrade, grade] : formData.casingGrade.filter(g => g !== grade);
    onChange("casingGrade", updatedGrades);
  };
  
  return (
    <div className="space-y-6">
      {isAdmin ? (
        <FormField 
          label="Store" 
          value={formData.store} 
          onChange={value => onChange("store", value)} 
          options={stores} 
          placeholder="Select store" 
          required 
        />
      ) : (
        <FormField 
          label="Store" 
          value={formData.store} 
          onChange={() => {}} 
          disabled={true} 
          required 
        />
      )}

      <FormField 
        label="Timestamp" 
        value={formData.timestamp} 
        onChange={() => {}} 
        disabled={true} 
      />

      <FormField 
        label="Name" 
        value={formData.name} 
        onChange={value => onChange("name", value)} 
        placeholder="Enter your name" 
        required 
      />

      <FormField 
        label="Manager's Email" 
        type="email" 
        value={formData.managerEmail || ''} 
        onChange={() => {}} 
        disabled={true} 
        placeholder="Manager's email will be automatically set" 
      />

      <FormField 
        label="Product Number" 
        value={formData.productNumber} 
        onChange={value => onChange("productNumber", value)} 
        placeholder="Enter product number" 
        required 
      />

      <div className="space-y-3">
        <Label className="block text-sm font-medium text-gray-700">Casing Grade <span className="text-red-500">*</span></Label>
        <Card className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {casingGrades.map(grade => (
              <div key={grade.value} className="flex items-center space-x-3">
                <Checkbox 
                  id={grade.value} 
                  checked={formData.casingGrade.includes(grade.value)} 
                  onCheckedChange={checked => handleCasingGradeChange(grade.value, checked as boolean)} 
                  className="h-5 w-5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <Label 
                  htmlFor={grade.value} 
                  className="text-sm text-gray-700 font-normal"
                >
                  {grade.name}
                </Label>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <FormField 
        label="Tire Size" 
        value={formData.tireSize} 
        onChange={value => onChange("tireSize", value)} 
        options={tireSizes} 
        placeholder="Select tire size" 
        required 
      />

      {formData.tireSize === 'custom' && (
        <FormField 
          label="Custom Tire Size" 
          value={formData.customTireSize} 
          onChange={value => onChange("customTireSize", value)} 
          placeholder="Enter custom tire size" 
          required 
        />
      )}

      <FormField 
        label="Tire Tread Needed" 
        value={formData.tireTreadNeeded} 
        onChange={value => onChange("tireTreadNeeded", value)} 
        placeholder="Enter tire tread needed" 
        required 
      />

      <FormField 
        label="Quantity" 
        type="number" 
        value={formData.quantity} 
        onChange={value => onChange("quantity", value)} 
        placeholder="Enter quantity" 
        required 
      />

      <FormField 
        label="Notes" 
        value={formData.notes} 
        onChange={value => onChange("notes", value)} 
        placeholder="Enter any additional notes" 
      />
    </div>
  );
};
