
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  NeoSelect, 
  NeoSelectContent, 
  NeoSelectItem, 
  NeoSelectTrigger, 
  NeoSelectValue 
} from "@/components/ui/NeoSelect";
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
          <NeoSelect
            onValueChange={field.onChange}
            defaultValue={field.value}
            value={field.value}
          >
            <FormControl>
              <NeoSelectTrigger>
                <NeoSelectValue placeholder="Yes or No" />
              </NeoSelectTrigger>
            </FormControl>
            <NeoSelectContent>
              {crossDockOptions.map((option) => (
                <NeoSelectItem key={option.value} value={option.value}>
                  {option.name}
                </NeoSelectItem>
              ))}
            </NeoSelectContent>
          </NeoSelect>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
