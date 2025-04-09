
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crossDockOptions, stores } from "@/components/order-form/formConfig";

interface CrossDockSectionProps {
  form: UseFormReturn<OrderFormValues>;
  showCrossDockDestination: boolean;
}

export function CrossDockSection({ 
  form, 
  showCrossDockDestination 
}: CrossDockSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="crossDock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cross Dock*</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
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
      
      {showCrossDockDestination && (
        <FormField
          control={form.control}
          name="crossDockDestination"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cross Dock Destination*</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter cross dock destination" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
