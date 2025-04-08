
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { scheduleOptions } from "@/components/order-form/formConfig";
import { Calendar, MessageSquare } from "lucide-react";

interface ScheduleSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function ScheduleSection({ form }: ScheduleSectionProps) {
  return (
    <>
      <div className="flex items-center space-x-2 mb-6 border-l-4 border-orange-500 pl-3">
        <Calendar className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Schedule & Notes</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="scheduleArrival"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                Schedule Arrival*
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="transition-all border-gray-300 focus:border-orange-300 focus:ring-1 focus:ring-orange-200">
                    <SelectValue placeholder="Select arrival day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {scheduleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                Notes
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any additional notes" 
                  className="resize-none min-h-[100px] transition-all border-gray-300 focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
