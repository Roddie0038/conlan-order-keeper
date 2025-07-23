
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
import { Mail, FileText, Calendar } from "lucide-react";

interface OrderInfoFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  destManagerEmail: string;
  isAdmin: boolean;
}

export function OrderInfoFields({ form, destManagerEmail, isAdmin }: OrderInfoFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="receiverNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <FileText className="h-4 w-4 mr-1 text-gray-400" />
              Receiver No*
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter receiver number" {...field} className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="destinationManagerEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <Mail className="h-4 w-4 mr-1 text-gray-400" />
              Destination Manager Email
            </FormLabel>
            <FormControl>
              <Input 
                {...field}
                value={destManagerEmail}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={true} 
                className="bg-gray-100 border-gray-300" 
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
          <FormItem className="col-span-full">
            <FormLabel className="flex items-center">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              ETA Date*
            </FormLabel>
            <FormControl>
              <Input type="date" {...field} className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
