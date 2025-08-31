
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { Truck, Printer } from "lucide-react";
import { useState, useEffect } from "react";
import { getFirstManagerEmail } from "@/utils/emailUtils";
import { useAuth } from "@/contexts/AuthContext";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { NeoField } from "@/components/ui/NeoField";
import { NeoSelect } from "@/components/ui/NeoSelect";
import { NeoButton } from "@/components/ui/NeoButton";
import { PLANT_STORE_MAP } from "@/utils/plantMapping";

interface CrossDockDetailsFormProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockDetailsForm({ form }: CrossDockDetailsFormProps) {
  const [destManagerEmail, setDestManagerEmail] = useState<string>("");
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // Update manager email when destination store changes
  useEffect(() => {
    const destStore = form.watch("crossDockDestination");
    if (destStore) {
      const loadEmail = async () => {
        console.log("🔍 CROSS-DOCK - Loading manager email for store:", destStore);
        const email = await getFirstManagerEmail(destStore);
        console.log("🔍 CROSS-DOCK - Got manager email:", email);
        
        if (email) {
          setDestManagerEmail(email);
          form.setValue("destinationManagerEmail", email);
        } else {
          setDestManagerEmail(`No manager email found for ${destStore}`);
          form.setValue("destinationManagerEmail", "");
        }
      };
      loadEmail();
    }
  }, [form.watch("crossDockDestination"), form]);

  const handleDestinationChange = async (value: string) => {
    console.log("🔍 CROSS-DOCK - Destination store changed to:", value);
    const email = await getFirstManagerEmail(value);
    console.log("🔍 CROSS-DOCK - Setting destination manager email to:", email);
    
    if (email) {
      setDestManagerEmail(email);
      form.setValue("destinationManagerEmail", email);
    } else {
      setDestManagerEmail(`No manager email found for ${value}`);
      form.setValue("destinationManagerEmail", "");
    }
  };

  // Auto-validate that FROM and TO stores are different
  useEffect(() => {
    const fromStore = form.watch("store");
    const toStore = form.watch("crossDockDestination");
    
    console.log("🔍 CROSS-DOCK - Store validation:", { fromStore, toStore });
    
    if (fromStore && toStore && fromStore === toStore) {
      form.setError("crossDockDestination", {
        type: "manual",
        message: "Destination store cannot be the same as origin store"
      });
    } else {
      form.clearErrors("crossDockDestination");
    }
  }, [form.watch("store"), form.watch("crossDockDestination"), form]);
  
  // Generate destination options from plant-store mapping
  const getAllStoresAndPlants = () => {
    const destinations: Array<{ value: string; label: string; type: 'store' | 'plant' }> = [];
    
    // Add all stores from plant mapping
    Object.values(PLANT_STORE_MAP).flat().forEach(store => {
      destinations.push({ value: store, label: store, type: 'store' });
    });
    
    // Add all plants
    Object.keys(PLANT_STORE_MAP).forEach(plant => {
      destinations.push({ value: plant, label: plant, type: 'plant' });
    });
    
    return destinations.sort((a, b) => a.label.localeCompare(b.label));
  };

  const destinationOptions = getAllStoresAndPlants();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="mb-4 text-sm font-medium text-neutral-200 flex items-center">
        <Truck className="h-4 w-4 mr-2" />
        Cross Dock Details
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="crossDockDestination"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-200">Cross Dock Destination *</FormLabel>
              <FormControl>
                <select
                  className="neopill"
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                >
                  <option value="" disabled hidden>Select destination store or plant</option>
                  {destinationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.type === 'store' ? 'Store' : 'Plant'})
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="receiverNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-neutral-200">Receiver No *</FormLabel>
              <FormControl>
                <NeoField {...field} placeholder="Receiver Number" />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="etaDate"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-sm font-medium text-neutral-200">ETA Date *</FormLabel>
              <FormControl>
                <NeoField {...field} type="date" placeholder="ETA Date" />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div className="md:col-span-2 flex items-center gap-3">
          <FormField
            control={form.control}
            name="crossDockConfirmation"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-5 w-5 rounded border-white/10 bg-neutral-900 text-fuchsia-400 focus:ring-fuchsia-300"
                  />
                </FormControl>
                <FormLabel className="text-sm text-neutral-300">
                  I confirm Cross Dock paperwork is printed and attached
                </FormLabel>
              </FormItem>
            )}
          />
          <div className="ml-auto">
            <NeoButton 
              variant="ghost" 
              onClick={() => console.log("Print cross dock form")}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Only (Test)
            </NeoButton>
          </div>
        </div>
      </div>
    </div>
  );
}
