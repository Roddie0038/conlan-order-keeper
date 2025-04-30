
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { Truck } from "lucide-react";

interface StoreInfoDisplayProps {
  form: UseFormReturn<OrderFormValues>;
}

export function StoreInfoDisplay({ form }: StoreInfoDisplayProps) {
  return (
    <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
        <Truck className="h-4 w-4 text-blue-500" />
        <span>Your order will be processed at <strong>{form.getValues().store || "selected store"}</strong></span>
      </div>
    </div>
  );
}
