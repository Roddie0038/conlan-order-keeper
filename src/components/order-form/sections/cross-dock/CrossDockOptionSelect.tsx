
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

interface CrossDockOptionSelectProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockOptionSelect({ form }: CrossDockOptionSelectProps) {
  return (
    <FormField
      control={form.control}
      name="crossDock"
      render={({ field }) => (
        <FormItem className="text-center">
          <FormLabel className="flex items-center justify-center">
            <Truck className="h-4 w-4 mr-1 text-gray-400" />
            Cross Dock*
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
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
  );
}
