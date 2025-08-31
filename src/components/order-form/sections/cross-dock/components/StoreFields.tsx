
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
import { stores } from "@/components/order-form/formConfig";
import { MapPin, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface StoreFieldsProps {
  form: UseFormReturn<OrderFormValues>;
  onDestinationChange: (value: string) => void;
  isAdmin: boolean;
}

export function StoreFields({ form, onDestinationChange, isAdmin }: StoreFieldsProps) {
  const { user } = useAuth();
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
              {!isAdmin && !user?.hasFullStoreAccess && <Lock className="h-3 w-3 ml-1 text-gray-500" />}
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value} 
              disabled={!isAdmin && !user?.hasFullStoreAccess}
            >
              <FormControl>
                <SelectTrigger className={`transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200 ${!isAdmin && !user?.hasFullStoreAccess ? 'bg-gray-100' : ''}`}>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
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
        name="crossDockDestination"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-gray-400" />
              TO Store*
            </FormLabel>
            <Select 
              onValueChange={(value) => {
                // Find the selected store and pass the full name to email lookup
                const selectedStore = stores.find(s => s.id === value);
                const fullStoreName = selectedStore?.name ?? value;
                field.onChange(value);
                onDestinationChange(fullStoreName);
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200">
                  <SelectValue placeholder="Select destination store" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {stores.map((store) => (
                  <SelectItem 
                    key={store.id} 
                    value={store.id}
                    disabled={(!isAdmin && !user?.hasFullStoreAccess) && store.id === form.watch("store")}
                  >
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
