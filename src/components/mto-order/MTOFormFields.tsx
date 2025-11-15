import { FormField } from "../order-form/FormField";
import { useOTStores } from "@/integrations/ot-platform/hooks/useOTStores";
import { casingGrades, tireSizes, scheduleOptions, MTOFormData } from "./mto-form-config";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getPlantForStore } from "@/utils/storeHelpers";
import { InventoryAvailabilityAlert } from "../order-form/InventoryAvailabilityAlert";

interface MTOFormFieldsProps {
  formData: MTOFormData;
  onChange: (field: string, value: string | string[]) => void;
  isAdmin?: boolean;
  section?: "store" | "product" | "order" | "all";
}

export const MTOFormFields = ({
  formData,
  onChange,
  isAdmin = false,
  section = "all"
}: MTOFormFieldsProps) => {
  const { data: stores = [], isLoading } = useOTStores();
  
  const handleCasingGradeChange = (grade: string, checked: boolean) => {
    const updatedGrades = checked ? [...formData.casingGrade, grade] : formData.casingGrade.filter(g => g !== grade);
    onChange("casingGrade", updatedGrades);
  };

  // Calculate plant based on selected store
  const plant = formData.store ? getPlantForStore(formData.store) : "";
  
  // Store Information Fields
  const renderStoreFields = () => (
    <div className="space-y-4">
      <div className="mb-5">
        <h4 className="text-black text-base font-medium mb-2">Store Information</h4>
        <Separator className="bg-gray-300" />
      </div>
      
      <FormField 
        label="Store" 
        value={formData.store} 
        onChange={value => onChange("store", value)} 
        options={stores.map(s => ({ id: s.store_number, name: s.store_name, value: s.store_number }))}
        placeholder="Select store" 
        disabled={!isAdmin && formData.store !== "Unassigned"}
        required 
      />

      {/* Plant Field - Read-only, auto-fills based on store */}
      <FormField 
        label="Plant" 
        value={plant || ""} 
        onChange={() => {}} 
        disabled={true} 
        placeholder="Plant will be automatically assigned" 
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
        <Label className="text-sm font-medium text-gray-700">Casing Grade <span className="text-red-500">*</span></Label>
        <Card className="p-4 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {casingGrades.map(grade => (
              <div key={grade.value} className="flex items-center space-x-3 group">
                <div className="relative">
                  <Checkbox 
                    id={grade.value} 
                    checked={formData.casingGrade.includes(grade.value)} 
                    onCheckedChange={checked => handleCasingGradeChange(grade.value, checked as boolean)} 
                    className="h-5 w-5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 transition-all" 
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

      {/* Real-time Inventory Availability Check */}
      {formData.productNumber && plant && (
        <div className="mt-4">
          <InventoryAvailabilityAlert 
            productNumber={formData.productNumber}
            plant={plant}
            requestedQuantity={parseInt(formData.quantity) || 0}
          />
        </div>
      )}

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
  if (section === "product") return renderProductFields();
  if (section === "order") return renderOrderFields();
  
  // Render all sections if no specific section is specified
  return (
    <div className="space-y-6">
      {renderStoreFields()}
      {renderProductFields()}
      {renderOrderFields()}
    </div>
  );
};
