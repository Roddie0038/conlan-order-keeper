
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { submitToGoogleSheets } from "@/services/sheets";
import { stores, scheduleOptions, crossDockOptions, getManagerEmail } from "@/components/order-form/formConfig";

// Define the schema for the form
const formSchema = z.object({
  yourName: z.string().min(2, { message: "Please enter your name" }),
  store: z.string().min(1, { message: "Please select a store" }),
  dateReceived: z.date({ required_error: "Please select a date" }),
  productNumber: z.string().min(1, { message: "Please enter the product number" }),
  description: z.string().min(1, { message: "Please enter the product description" }),
  quantity: z.string().min(1, { message: "Please enter the quantity" }),
  scheduleArrival: z.string().min(1, { message: "Please select an arrival day" }),
  notes: z.string().optional(),
  crossDock: z.string().min(1, { message: "Please select yes or no" }),
  crossDockDestination: z.string().optional(),
});

export function OrderForm() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    yourName: "",
    store: user?.store || "",
    dateReceived: new Date(),
    productNumber: "",
    description: "",
    quantity: "",
    scheduleArrival: "",
    notes: "",
    crossDock: "",
    crossDockDestination: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const showCrossDockDestination = form.watch("crossDock") === "yes";

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Get the manager's email for the selected store
    const managersEmail = getManagerEmail(values.store);
    
    try {
      // Add order to localStorage
      const pendingOrders = JSON.parse(localStorage.getItem("pendingOrders") || "[]");
      const newOrder = {
        ...values,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        managersEmail,
        plant: selectedPlant,
      };
      
      pendingOrders.push(newOrder);
      localStorage.setItem("pendingOrders", JSON.stringify(pendingOrders));
      
      // Submit to Google Sheets
      const result = await submitToGoogleSheets({
        ...values,
        timestamp: new Date().toISOString(),
        dateReceived: values.dateReceived.toISOString(),
        managersEmail,
        plant: selectedPlant,
      });
      
      if (result.status === "success") {
        toast({
          title: "Order Submitted",
          description: "Your order has been submitted successfully.",
        });
        form.reset(defaultValues);
      } else {
        toast({
          title: "Failed to Submit",
          description: "There was an error submitting your order to Google Sheets.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 bg-white shadow-xl p-8 rounded-2xl border border-gray-200">
      <div>
        <h2 className="text-2xl font-bold mb-2">New Order Form</h2>
        <p className="text-gray-600 mb-4">Please fill out all required fields</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="yourName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
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
                  <FormLabel>Store*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
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
          </div>
          
          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="dateReceived"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date Received*</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="productNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Number*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter product description" 
                      className="resize-none"
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
                  <FormLabel>Quantity*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter quantity" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="scheduleArrival"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Arrival*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select arrival day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {scheduleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.value}
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter any additional notes" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="crossDock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cross Dock*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Yes or No" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {crossDockOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {showCrossDockDestination && (
              <FormField
                control={form.control}
                name="crossDockDestination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cross Dock Destination*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter cross dock destination" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          
          <div>
            {/* Plant info display */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 flex items-center">
                <span className="font-medium mr-2">Selected Plant:</span> {selectedPlant}
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-6 text-lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Order"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
