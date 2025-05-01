
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
    <>
      <div className="flex items-center space-x-2 mb-6 border-l-4 border-purple-500 pl-3">
        <Truck className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Cross Dock Options</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CrossDockOptionSelect form={form} />

        {showCrossDockDestination && (
          <CrossDockDetailsForm form={form} />
        )}
      </div>
      
      <StoreInfoBar form={form} />
    </>
  );
}
