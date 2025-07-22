
import { FormField } from "../order-form/FormField";
import { stores } from "../order-form/formConfig";
import { casingGrades, tireSizes, scheduleOptions, MTOFormData } from "./mto-form-config";
import type { MTOFormSection } from "./mto-form-config";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MandatoryPlantSelector } from "@/components/ui/mandatory-plant-selector";

interface MTOFormFieldsProps {
  formData: MTOFormData;
  onChange: (field: string, value: string | string[]) => void;
  isAdmin?: boolean;
  section?: MTOFormSection;
  plantError?: string;
}

export const MTOFormFields = ({
  formData,
  onChange,
  isAdmin = false,
  section = "all",
  plantError
}: MTOFormFieldsProps) => {
  const handleCasingGradeChange = (grade: string) => {
    onChange("casingGrade", grade);
  };
  
  // Store Information Fields
  const renderStoreFields = () => (
    <div className="space-y-4">
      <div className="mb-5">
        <h4 className="text-black text-base font-medium mb-2">Store Information</h4>
        <Separator className="bg-gray-300" />
      </div>
      
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
    </div>
  );
  
  // Plant Selection Field (separate from store fields)
  const renderPlantSelector = () => (
    <MandatoryPlantSelector
      value={formData.destinationPlant || ""}
      onChange={(value) => onChange("destinationPlant", value)}
      error={plantError}
    />
  );
  
  // Product Details Fields
  const renderProductFields = () => (
    <div className="space-y-4">
      <div className="mb-5">
        <h4 className="text-black text-base font-medium mb-2">Product Information</h4>
        <Separator className="bg-gray-300" />
      </div>
      
      <FormField 
        label="Product Number" 
        value={formData.productNumber} 
        onChange={value => onChange("productNumber", value)} 
        placeholder="Enter product number" 
        required 
      />
      
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Select a Casing Grade (A, B, or C): <span className="text-red-500">*</span></Label>
        <Card className="p-4 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {casingGrades.map(grade => (
              <div key={grade.value} className="flex items-center space-x-3 group">
                <div className="relative">
                  <input
                    type="radio"
                    id={grade.value}
                    name="casingGrade"
                    value={grade.value}
                    checked={formData.casingGrade === grade.value}
                    onChange={() => handleCasingGradeChange(grade.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <Label 
                  htmlFor={grade.value} 
                  className="text-sm text-gray-700 font-normal group-hover:text-blue-600 transition-colors cursor-pointer"
                >
                  {grade.name}
                </Label>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
  
  // Order Specification Fields
  const renderOrderFields = () => (
    <div className="space-y-4">
      <div className="mb-5">
        <h4 className="text-black text-base font-medium mb-2">Order Specifications</h4>
        <Separator className="bg-gray-300" />
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
  
  // Render appropriate sections based on the prop
  if (section === "store") return renderStoreFields();
  if (section === "plant") return renderPlantSelector();
  if (section === "product") return renderProductFields();
  if (section === "order") return renderOrderFields();
  
  // Render all sections if no specific section is specified
  return (
    <div className="space-y-6">
      {renderStoreFields()}
      {renderPlantSelector()}
      {renderProductFields()}
      {renderOrderFields()}
    </div>
  );
};
