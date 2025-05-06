
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "@/components/order-form/order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileText, Calendar as CalendarIcon, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

interface OrderInfoFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  destManagerEmail: string;
}

export function OrderInfoFields({ form, destManagerEmail }: OrderInfoFieldsProps) {
  return (
    <>
      <FormItem>
        <FormLabel className="flex items-center">
          <Mail className="h-4 w-4 mr-1 text-gray-400" />
          Destination Manager Email
        </FormLabel>
        <Input
          value={destManagerEmail}
          readOnly
          className="bg-gray-100 border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200"
        />
      </FormItem>
      
      <FormField
        control={form.control}
        name="receiverNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <FileText className="h-4 w-4 mr-1 text-gray-400" />
              Receiver No (MaddenCo)*
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Enter receiver number"
                {...field}
                className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="etaDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
              ETA Date*
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? format(new Date(field.value), "PPP")
                      : "Pick a date"}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={(date) =>
                    field.onChange(date ? date.toISOString() : "")
                  }
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
