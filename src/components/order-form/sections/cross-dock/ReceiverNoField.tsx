
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileText } from "lucide-react";

interface ReceiverNoFieldProps {
  form: UseFormReturn<OrderFormValues>;
}

export function ReceiverNoField({ form }: ReceiverNoFieldProps) {
  return (
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
  );
}
