
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

interface CrossDockConfirmationFieldProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockConfirmationField({ form }: CrossDockConfirmationFieldProps) {
  return (
    <FormField
      control={form.control}
      name="crossDockConfirmation"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="font-medium">
              I confirm Cross Dock paperwork is printed and attached
            </FormLabel>
            <p className="text-sm text-gray-500">
              This confirmation is required for cross dock orders
            </p>
          </div>
        </FormItem>
      )}
    />
  );
}
