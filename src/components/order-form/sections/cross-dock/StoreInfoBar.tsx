
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { InfoIcon } from "lucide-react";
import { useWatch } from "react-hook-form";

interface StoreInfoBarProps {
  form: UseFormReturn<OrderFormValues>;
}

export function StoreInfoBar({ form }: StoreInfoBarProps) {
  const store = useWatch({
    control: form.control,
    name: "store",
  });
  
  const crossDockStore = useWatch({
    control: form.control,
    name: "crossDockDestination",
  });
  
  // Skip showing this message if in admin mode with no store
  if (!store || store === "Admin") {
    return null;
  }
  
  return (
    <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg text-center">
      <div className="flex items-center justify-center text-sm text-blue-700 dark:text-blue-300">
        <InfoIcon className="h-4 w-4 mr-2 text-blue-500" />
        <span>
          Your order will be processed from <span className="font-medium">{store}</span>
          {crossDockStore && (
            <> and sent to <span className="font-medium">{crossDockStore}</span></>
          )}
        </span>
      </div>
    </div>
  );
}
