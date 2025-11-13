
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "@/components/order-form/order-form-schema";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOTStores } from "@/integrations/ot-platform/hooks/useOTStores";
import { MapPin, Lock } from "lucide-react";

interface StoreFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  onDestinationChange: (value: string) => void;
  isAdmin: boolean;
}

export function StoreFields({ form, onDestinationChange, isAdmin }: StoreFieldsProps) {
  const { data: stores = [], isLoading } = useOTStores();
  
  return (
    <>
      <FormField
        control={form.control}
        name="store"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              FROM Store*
              {!isAdmin && <Lock className="h-3 w-3 ml-1 text-gray-500" />}
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value} 
              disabled={!isAdmin}
            >
              <FormControl>
                <SelectTrigger className={`transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200 ${!isAdmin ? 'bg-gray-100' : ''}`}>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading stores...</SelectItem>
                ) : (
                  stores.map((store) => (
                    <SelectItem key={store.store_number} value={store.store_number}>
                      {store.store_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="crossDockDestination"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              TO Store*
            </FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                onDestinationChange(value);
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200">
                  <SelectValue placeholder="Select destination store" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading stores...</SelectItem>
                ) : (
                  stores.map((store) => (
                    <SelectItem 
                      key={store.store_number} 
                      value={store.store_number}
                      disabled={!isAdmin && store.store_number === form.watch("store")}
                    >
                      {store.store_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
