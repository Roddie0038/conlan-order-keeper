
import { FormData } from "../formConfig";
import { FormField } from "../FormField";
import { Truck, Building } from "lucide-react";
import { crossDockOptions, stores } from "../formConfig";
import { CrossDockDetailForm } from "../components/CrossDockDetailForm";

interface CrossDockOptionsProps {
  formData: FormData;
  onChange: (field: keyof FormData, value: string) => void;
}

export const CrossDockOptions = ({ formData, onChange }: CrossDockOptionsProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 border-l-4 border-purple-500 pl-3">
        <Truck className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-medium text-white">Cross Dock Options</h3>
      </div>

      <div className="pl-4 space-y-4">
        <FormField 
          label="Cross Dock" 
          required 
          value={formData.crossDock} 
          onChange={value => onChange("crossDock", value)} 
          options={crossDockOptions} 
          placeholder="Select yes/no" 
        />

        {formData.crossDock === "yes" && (
          <>
            <FormField 
              label="Cross Dock Destination" 
              value={formData.crossDockDestination || ""} 
              onChange={value => onChange("crossDockDestination", value)} 
              options={stores} 
              placeholder="Select destination" 
              required 
            />
            
            {/* Render the Cross Dock detail form for additional required fields */}
            <CrossDockDetailForm 
              formData={formData} 
              onChange={onChange} 
            />
          </>
        )}

        <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Building className="h-4 w-4 text-blue-500" />
            <span>Your order will be processed at <strong>{formData.store || "selected store"}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
