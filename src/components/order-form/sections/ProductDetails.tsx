
import { FormData } from "../types";
import { FormField } from "../FormField";
import { Package, Hash } from "lucide-react";

interface ProductDetailsProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export const ProductDetails = ({ formData, onChange }: ProductDetailsProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 border-l-4 border-green-500 pl-3">
        <Package className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-medium text-white">Product Details</h3>
      </div>

      <div className="pl-4 space-y-4">
        <FormField 
          label="Product Number" 
          required 
          value={formData.productNumber} 
          onChange={value => onChange("productNumber", value)} 
          placeholder="Enter product number" 
        />

        <FormField 
          label="Description" 
          required 
          value={formData.description} 
          onChange={value => onChange("description", value)} 
          placeholder="Enter product description" 
        />

        <FormField 
          label="Quantity" 
          type="number" 
          required 
          value={formData.quantity} 
          onChange={value => onChange("quantity", value)} 
          placeholder="Enter quantity" 
        />
      </div>
    </div>
  );
};
