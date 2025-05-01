
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stores, getManagerEmail } from "@/components/order-form/formConfig";
import { Truck, MapPin, FileText, Calendar as CalendarIcon, Printer, Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useRef } from "react";
import { CrossDockPaperworkForm } from "../../CrossDockPaperworkForm";
import { useReactToPrint } from "react-to-print";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface CrossDockDetailsFormProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockDetailsForm({ form }: CrossDockDetailsFormProps) {
  const printComponentRef = useRef<HTMLDivElement>(null);
  const [destManagerEmail, setDestManagerEmail] = useState<string>("");
  const { toast } = useToast();
  
  // Update manager email when destination store changes
  useEffect(() => {
    const destStore = form.watch("crossDockDestination");
    if (destStore) {
      const email = getManagerEmail(destStore);
      setDestManagerEmail(email || "");
    }
  }, [form.watch("crossDockDestination")]);
  
  const handlePrintForm = useReactToPrint({
    content: () => printComponentRef.current,
    documentTitle: "Cross-Dock-Transfer-Form",
    onBeforePrint: async () => {
      console.log("Preparing to print cross dock form...");
      return Promise.resolve(); // Ensures the type matches Promise<void>
    },
    onPrintError: (error) => {
      console.error("Print error:", error);
      toast({
        title: "Print Error",
        description: "Failed to print the form. Please try again.",
        variant: "destructive"
      });
    },
    onAfterPrint: () => {
      console.log("Cross dock form printed successfully");
      toast({
        title: "Success",
        description: "Form printed successfully!",
        duration: 3000
      });
    }
  });
  
  return (
    <Card className="mt-4 p-4 border border-purple-200 bg-purple-50 dark:bg-purple-900/20">
      <div className="mb-4 border-b border-purple-200 pb-2">
        <div className="flex justify-center items-center">
          <h4 className="text-md font-medium text-purple-700 dark:text-purple-300 flex items-center">
            <Truck className="h-4 w-4 mr-2" />
            Cross Dock Form Details
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="store"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                FROM Store*
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200">
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
                  field.onChange(value);
                  const email = getManagerEmail(value);
                  setDestManagerEmail(email || "");
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

        <FormItem>
          <FormLabel className="flex items-center">
            <Mail className="h-4 w-4 mr-1 text-gray-400" />
            Destination Manager Email
          </FormLabel>
          <Input
            value={destManagerEmail}
            readOnly
            className="bg-gray-100 border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200"
          />
        </FormItem>
        
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

        <FormField
          control={form.control}
          name="etaDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                ETA Date*
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? format(new Date(field.value), "PPP")
                        : "Pick a date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 pointer-events-auto" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? date.toISOString() : "")
                    }
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-4">
        <FormField
          control={form.control}
          name="crossDockConfirmation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-medium">
                  I confirm Cross Dock paperwork is printed and attached
                </FormLabel>
                <p className="text-sm text-gray-500">
                  This confirmation is required for cross dock orders
                </p>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Print button moved to the bottom - Fixed to prevent form submission */}
      <div className="mt-6 flex justify-center">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          className="flex items-center border-purple-300 hover:bg-purple-100 text-purple-700 dark:text-purple-300 w-full md:w-auto"
          onClick={(e) => {
            e.preventDefault(); // Prevent form submission
            handlePrintForm();
          }}
        >
          <Printer className="h-4 w-4 mr-1" />
          Print Form
        </Button>
      </div>

      {/* Hidden div that contains the printable form - Fixed to ensure proper ref */}
      <div className="hidden">
        <div ref={printComponentRef} className="p-8 bg-white">
          <CrossDockPaperworkForm form={form} />
        </div>
      </div>
    </Card>
  );
}
