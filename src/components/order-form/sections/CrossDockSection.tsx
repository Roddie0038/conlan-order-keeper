
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
import { Truck, MapPin, Building } from "lucide-react";

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
                onValueChange={field.onChange}
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
        
        {showCrossDockDestination && (
          <FormField
            control={form.control}
            name="crossDockDestination"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  Cross Dock Destination*
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter cross dock destination" 
                    {...field}
                    className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
      
      <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Building className="h-4 w-4 text-blue-500" />
          <span>Your order will be processed at <strong>{form.getValues().store || "selected store"}</strong></span>
        </div>
      </div>
    </>
  );
}
