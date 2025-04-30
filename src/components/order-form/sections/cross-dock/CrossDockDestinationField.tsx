
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
import { stores } from "@/components/order-form/formConfig";
import { MapPin } from "lucide-react";

interface CrossDockDestinationFieldProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockDestinationField({ form }: CrossDockDestinationFieldProps) {
  return (
    <FormField
      control={form.control}
      name="crossDockDestination"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            Destination Store*
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200">
                <SelectValue placeholder="Select destination store" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.name}
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
