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
import { Textarea } from "@/components/ui/textarea";
import { Package, FileText, Hash } from "lucide-react";
import { InventoryAvailabilityAlert } from "../InventoryAvailabilityAlert";
import { usePlant } from "@/contexts/PlantContext";

interface ProductSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function ProductSection({ form }: ProductSectionProps) {
  const { selectedPlant } = usePlant();
  const productNumber = form.watch("productNumber");
  const quantity = form.watch("quantity");
  
  return (
    <>
      <div className="flex items-center space-x-2 mb-6 border-l-4 border-green-500 pl-3">
        <Package className="h-5 w-5 text-green-500" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Product Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="productNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Hash className="h-4 w-4 mr-1 text-gray-400" />
                Product Number*
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter product number" 
                  {...field} 
                  className="transition-all border-gray-300 focus:border-green-300 focus:ring-1 focus:ring-green-200" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <FileText className="h-4 w-4 mr-1 text-gray-400" />
                Description*
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product description" 
                  className="resize-none min-h-[100px] transition-all border-gray-300 focus:border-green-300 focus:ring-1 focus:ring-green-200"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Hash className="h-4 w-4 mr-1 text-gray-400" />
                Quantity*
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter quantity" 
                  {...field} 
                  className="transition-all border-gray-300 focus:border-green-300 focus:ring-1 focus:ring-green-200" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {/* Real-time Inventory Availability Check */}
      {productNumber && selectedPlant && (
        <div className="mt-6">
          <InventoryAvailabilityAlert 
            productNumber={productNumber}
            plant={selectedPlant}
            requestedQuantity={parseInt(quantity) || 0}
          />
        </div>
      )}
    </>
  );
}
