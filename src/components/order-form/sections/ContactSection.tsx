
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
import { useOTStores } from "@/integrations/ot-platform/hooks/useOTStores";
// REMOVED: Email routing now handled by OT Platform
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, User, Building, Calendar as CalendarIcon2, Mail, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { getCurrentDateTime } from "@/utils/dateTime";
import { getStoreEmailRecipients } from "@/services/emailRouting";

interface ContactSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function ContactSection({ form }: ContactSectionProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  const [managerEmails, setManagerEmails] = useState<string>("");
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const { data: storeOptions = [], isLoading: isLoadingStores } = useOTStores();
  
  // Determine if user can choose store (admin or no assigned store)
  const hasAssignedStore = Boolean(user?.store && user.store.trim().toLowerCase() !== 'unassigned');
  const canChooseStore = isAdmin || !hasAssignedStore;
  
  // Function to extract store number from store name
  const extractStoreNumber = (storeName: string): string => {
    if (storeName === "Admin") return "admin";
    const match = storeName.match(/\d+/);
    return match ? match[0] : "";
  };

  // Function to fetch manager emails from database
  const fetchManagerEmails = async (storeName: string) => {
    if (!storeName || storeName === "Admin") {
      setManagerEmails("admin@conlantire.com");
      return;
    }

    setIsLoadingEmails(true);
    try {
      const storeNumber = extractStoreNumber(storeName);
      const result = await getStoreEmailRecipients(storeNumber, 'transfer');
      
      if (result.recipients.length > 0) {
        const emailsString = result.recipients.join(', ');
        setManagerEmails(emailsString);
        form.setValue("managersEmail", emailsString);
      } else {
        // No recipients found - OT Platform will handle routing
        setManagerEmails("Email routing handled by OT Platform");
        form.setValue("managersEmail", "");
      }
    } catch (error) {
      console.error("Error fetching manager emails:", error);
      // OT Platform will handle email routing
      setManagerEmails("Email routing handled by OT Platform");
      form.setValue("managersEmail", "");
    } finally {
      setIsLoadingEmails(false);
    }
  };
  
  // Remove the useEffect that loads stores - now using OT Platform hook
  // useEffect removed - stores are loaded via useOTStores hook

  // Set the store to the user's store on component mount for non-admin users
  // Also set the current date and time
  useEffect(() => {
    // Set current date and time for all users
    form.setValue("dateReceived", getCurrentDateTime());
    
    if (user && user.store && !isAdmin) {
      const isUnassigned = user.store.trim().toLowerCase() === 'unassigned';
      if (!isUnassigned) {
        // Set store
        form.setValue("store", user.store);
        // Fetch and set manager emails
        fetchManagerEmails(user.store);
      } else {
        // Clear store for unassigned users so they can choose
        form.setValue("store", "");
        setManagerEmails("");
        form.setValue("managersEmail", "");
      }
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
    <>
      <div className="flex items-center space-x-2 mb-6 border-l-4 border-blue-500 pl-3">
        <User className="h-5 w-5 text-blue-500" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Contact Information</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="yourName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <User className="h-4 w-4 mr-1 text-gray-400" />
                Your Name*
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} className="transition-all border-gray-300 focus:border-blue-300 focus:ring-1 focus:ring-blue-200" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Building className="h-4 w-4 mr-1 text-gray-400" />
                Store*
                {!canChooseStore && <Lock className="h-3 w-3 ml-1 text-gray-500" />}
              </FormLabel>
               <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
                disabled={!canChooseStore}
              >
                <FormControl>
                  <SelectTrigger className={`transition-all border-gray-300 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 ${!canChooseStore ? 'bg-gray-100' : ''}`}>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isAdmin && (
                    <SelectItem value="Admin">Admin Only</SelectItem>
                  )}
                  {isLoadingStores ? (
                    <SelectItem value="loading" disabled>Loading stores...</SelectItem>
                  ) : (
                    storeOptions.map((store) => (
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
          name="managersEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Mail className="h-4 w-4 mr-1 text-gray-400" />
                Manager's Email
                <Lock className="h-3 w-3 ml-1 text-gray-500" />
              </FormLabel>
               <FormControl>
                <Input 
                  disabled={true} 
                  placeholder={isLoadingEmails ? "Loading manager emails..." : "Manager's email will be automatically set"} 
                  value={managerEmails}
                  className="bg-gray-100 transition-all border-gray-300" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateReceived"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex items-center">
                <CalendarIcon2 className="h-4 w-4 mr-1 text-gray-400" />
                Date Received*
                <Lock className="h-3 w-3 ml-1 text-gray-500" />
              </FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field}
                  disabled={true}
                  className="bg-gray-100 transition-all border-gray-300" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
