
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crossDockOptions } from "@/components/order-form/formConfig";
import { Truck } from "lucide-react";

interface CrossDockToggleProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockToggle({ form }: CrossDockToggleProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="crossDock"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Truck className="h-4 w-4 mr-1 text-gray-400" />
              Cross Dock*
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Reset the cross dock form fields if "no" is selected
                if (value === "no") {
                  form.setValue("crossDockDestination", "");
                  form.setValue("receiverNo", "");
                  form.setValue("etaDate", "");
                  form.setValue("crossDockConfirmation", false);
                }
              }}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200">
                  <SelectValue placeholder="Yes or No" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {crossDockOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
