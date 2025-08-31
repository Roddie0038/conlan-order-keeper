
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { NeoField } from "@/components/ui/NeoField";
import { NeoTextarea } from "@/components/ui/NeoTextarea";
import { Package, FileText, Hash } from "lucide-react";

interface ProductSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function ProductSection({ form }: ProductSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="productNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <Package className="w-4 h-4" />
              Product Number*
            </FormLabel>
            <FormControl>
              <NeoField 
                placeholder="Enter product number" 
                {...field} 
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="store"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <Hash className="w-4 h-4" />
              TO Store*
            </FormLabel>
            <FormControl>
              <NeoField 
                placeholder="Select destination store" 
                {...field} 
                disabled
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="receiverNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Receiver*
            </FormLabel>
            <FormControl>
              <NeoField 
                placeholder="Enter receiver number" 
                {...field} 
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="managersEmail"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white flex items-center gap-2">
              <Package className="w-4 h-4" />
              Destination Manager Email
            </FormLabel>
            <FormControl>
              <NeoField 
                placeholder="Auto-filled from store" 
                {...field} 
                disabled
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
    </div>
  );
}
