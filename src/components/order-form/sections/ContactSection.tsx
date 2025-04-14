
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
import { stores, getManagerEmail } from "@/components/order-form/formConfig";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, User, Building, Calendar as CalendarIcon2, Mail } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

interface ContactSectionProps {
  form: UseFormReturn<OrderFormValues>;
}

export function ContactSection({ form }: ContactSectionProps) {
  const { user } = useAuth();
  
  // Set the store to the user's store on component mount for non-admin users
  useEffect(() => {
    if (user && user.store && !user.isAdmin) {
      // Set store
      form.setValue("store", user.store);
      
      // Set manager email
      const managerEmail = getManagerEmail(user.store);
      if (managerEmail) {
        form.setValue("managersEmail", managerEmail);
      }
    }
  }, [user, form]);
  
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
              </FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  // Update manager email when store changes
                  const managerEmail = getManagerEmail(value);
                  form.setValue("managersEmail", managerEmail || "");
                }} 
                defaultValue={field.value}
                value={field.value}
                disabled={!user?.isAdmin}
              >
                <FormControl>
                  <SelectTrigger className="transition-all border-gray-300 focus:border-blue-300 focus:ring-1 focus:ring-blue-200">
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.name}>
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
          name="managersEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Mail className="h-4 w-4 mr-1 text-gray-400" />
                Manager's Email
              </FormLabel>
              <FormControl>
                <Input 
                  disabled={true} 
                  placeholder="Manager's email will be automatically set" 
                  {...field} 
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
              </FormLabel>
              <FormControl>
                <Input 
                  type="datetime-local" 
                  {...field}
                  className="transition-all border-gray-300 focus:border-blue-300 focus:ring-1 focus:ring-blue-200" 
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
