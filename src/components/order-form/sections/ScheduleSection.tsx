
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { NeoSelect, NeoSelectContent, NeoSelectItem, NeoSelectTrigger, NeoSelectValue } from "@/components/ui/NeoSelect";
import { NeoTextarea } from "@/components/ui/NeoTextarea";
import { scheduleOptions } from "@/components/order-form/formConfig";
import { Calendar, MessageSquare } from "lucide-react";

interface ScheduleSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function ScheduleSection({ form }: ScheduleSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="scheduleArrival"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Schedule Arrival*</FormLabel>
            <NeoSelect
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <NeoSelectTrigger>
                  <NeoSelectValue placeholder="Select arrival day" />
                </NeoSelectTrigger>
              </FormControl>
              <NeoSelectContent>
                {scheduleOptions.map((option) => (
                  <NeoSelectItem key={option.value} value={option.value}>
                    {option.value}
                  </NeoSelectItem>
                ))}
              </NeoSelectContent>
            </NeoSelect>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Notes</FormLabel>
            <FormControl>
              <NeoTextarea 
                placeholder="Enter any additional notes" 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
    </div>
  );
}
