
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { stores } from "@/components/order-form/formConfig";
import { getFirstManagerEmail } from "@/utils/emailUtils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, User, Building, Calendar as CalendarIcon2, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getCurrentDateTime } from "@/utils/dateTime";
import { EmailRecipientsPreview } from "@/components/shared/EmailRecipientsPreview";
import { hasFullStoreAccess } from "@/lib/roles";
import StoreSelector from "@/components/common/StoreSelector";
import { normalizeStoreName } from "@/lib/stores";
import { OrderingEmailField } from "@/components/common/OrderingEmailField";
import { NeoField } from "@/components/ui/NeoField";
import { NeoSelect, NeoSelectContent, NeoSelectItem, NeoSelectTrigger, NeoSelectValue } from "@/components/ui/NeoSelect";
import { ColoredNeoSelectItem } from "@/components/ui/ColoredNeoSelectItem";
import { storeColors } from "@/components/order-form/formConfig";
import { DEFAULT_MANAGER_EMAIL } from '@/config/emails';

interface ContactSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function ContactSection({ form }: ContactSectionProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  const elevated = hasFullStoreAccess(user);
  const isUnassigned = user?.store === 'Unassigned';
  const [managerEmails, setManagerEmails] = useState<string>("");
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  
  // Function to extract store number from store name
  const extractStoreNumber = (storeName: string): string => {
    if (storeName === "Admin") return "Admin";
    const match = storeName.match(/\d+/);
    if (match) {
      const storeNumber = match[0];
      // Handle both padded and unpadded numbers
      return storeColors[storeNumber.padStart(3, '0')] ? storeNumber.padStart(3, '0') : storeNumber;
    }
    return "";
  };

  // Function to get store color class
  const getStoreColorClass = (storeName: string): string => {
    const storeNumber = extractStoreNumber(storeName);
    return storeColors[storeNumber] || "text-white";
  };

  // Function to fetch manager emails from database
  const fetchManagerEmails = async (storeName: string) => {
    if (!storeName || storeName === "Admin") {
      setManagerEmails(DEFAULT_MANAGER_EMAIL);
      return;
    }

    setIsLoadingEmails(true);
    try {
      const dynamicEmail = await getFirstManagerEmail(storeName);
      setManagerEmails(dynamicEmail);
      form.setValue("managersEmail", dynamicEmail);
    } catch (error) {
      console.error("Error fetching manager emails:", error);
      setManagerEmails(DEFAULT_MANAGER_EMAIL);
      form.setValue("managersEmail", DEFAULT_MANAGER_EMAIL);
    } finally {
      setIsLoadingEmails(false);
    }
  };
  
  // Set the store to the user's store on component mount for non-admin users
  // Also set the current date and time
  useEffect(() => {
    // Set current date and time for all users
    form.setValue("dateReceived", getCurrentDateTime());
    
    if (user && user.store && !isAdmin && !user.hasFullStoreAccess && !isUnassigned) {
      // Set store for non-admin users without full store access (excluding unassigned)
      form.setValue("store", user.store);
      // Fetch and set manager emails
      fetchManagerEmails(user.store);
    }
  }, [user, isAdmin, form]);

  // Watch for store changes and update manager emails
  const watchedStore = form.watch("store");
  useEffect(() => {
    if (watchedStore) {
      fetchManagerEmails(watchedStore);
    }
  }, [watchedStore]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="yourName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Your Name*</FormLabel>
            <FormControl>
              <NeoField placeholder="Enter your name" {...field} />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />
        
      {elevated ? (
        <div className="space-y-2">
          <span className="text-white text-sm font-medium">Store (Destination)*</span>
          <StoreSelector
            label=""
            value={form.watch("store") || ''}
            onChange={(value) => {
              const normalized = normalizeStoreName(value) || '';
              form.setValue("store", normalized);
            }}
            filterPlant={null}  // ignored for elevated users
            placeholder="Select destination store..."
            className="neopill"
          />
        </div>
      ) : (
        <FormField
          control={form.control}
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                Store*
                {!isAdmin && !user?.hasFullStoreAccess && !isUnassigned && <Lock className="h-3 w-3 ml-1 text-gray-300" />}
              </FormLabel>
              <NeoSelect 
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={!isAdmin && !user?.hasFullStoreAccess && !isUnassigned}
              >
                <FormControl>
                  <NeoSelectTrigger className={!isAdmin && !user?.hasFullStoreAccess && !isUnassigned ? 'opacity-70' : ''}>
                    <NeoSelectValue placeholder="Select a store" />
                  </NeoSelectTrigger>
                </FormControl>
                <NeoSelectContent>
                  {(isAdmin || user?.hasFullStoreAccess) && (
                    <ColoredNeoSelectItem value="Admin" colorClass={storeColors["Admin"]}>
                      Admin Only
                    </ColoredNeoSelectItem>
                  )}
                  {stores.map((store) => (
                    <ColoredNeoSelectItem key={store.id} value={store.name} colorClass={getStoreColorClass(store.name)}>
                      {store.name}
                    </ColoredNeoSelectItem>
                  ))}
                </NeoSelectContent>
              </NeoSelect>
              <FormMessage className="text-red-300" />
            </FormItem>
          )}
        />
      )}
        
      <div className="space-y-2">
        <OrderingEmailField
          value={form.watch("managersEmail") || ''}
          onChange={(email) => form.setValue("managersEmail", email)}
          fallbackEmail={managerEmails}
        />
      </div>

      <FormField
        control={form.control}
        name="dateReceived"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-white">
              Date Received*
              <Lock className="h-3 w-3 ml-1 text-blue-300" />
            </FormLabel>
            <FormControl>
              <NeoField 
                type="datetime-local" 
                {...field}
                disabled={true}
                className="opacity-70 cursor-not-allowed" 
              />
            </FormControl>
            <FormMessage className="text-red-300" />
          </FormItem>
        )}
      />

      {/* Email Recipients Preview moved to OrderForm.tsx to avoid duplication */}
    </div>
  );
}
