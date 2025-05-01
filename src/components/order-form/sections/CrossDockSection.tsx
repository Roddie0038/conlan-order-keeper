
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../order-form-schema";
import { Truck } from "lucide-react";
import { CrossDockOptionSelect } from "./cross-dock/CrossDockOptionSelect";
import { CrossDockDetailsForm } from "./cross-dock/CrossDockDetailsForm";
import { StoreInfoBar } from "./cross-dock/StoreInfoBar";

interface CrossDockSectionProps {
  form: UseFormReturn<OrderFormValues>;
  showCrossDockDestination: boolean;
}

export function CrossDockSection({ 
  form, 
  showCrossDockDestination 
}: CrossDockSectionProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center space-x-2 mb-6">
        <Truck className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Cross Dock Options</h3>
      </div>
      
      {/* Centered Cross Dock Options selector */}
      <div className="w-full max-w-xs mb-6">
        <CrossDockOptionSelect form={form} />
      </div>
      
      {/* Cross Dock Form Details section only shown when "Yes" is selected */}
      {showCrossDockDestination && (
        <div className="w-full mt-4">
          <CrossDockDetailsForm form={form} />
        </div>
      )}
      
      <StoreInfoBar form={form} />
    </div>
  );
}
