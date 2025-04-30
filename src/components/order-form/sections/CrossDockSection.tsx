
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
import { crossDockOptions, stores } from "@/components/order-form/formConfig";
import { Truck, MapPin, Building, FileText, CalendarIcon, Printer, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CrossDockSectionProps {
  form: UseFormReturn<OrderFormValues>;
  showCrossDockDestination: boolean;
  onPrintForm?: () => void;
}

export function CrossDockSection({ 
  form, 
  showCrossDockDestination,
  onPrintForm
}: CrossDockSectionProps) {
  // Get the current date for the calendar
  const today = new Date();
  
  return (
    <>
      <div className="flex items-center space-x-2 mb-6 border-l-4 border-purple-500 pl-3">
        <Truck className="h-5 w-5 text-purple-500" />
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Cross Dock Options</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="crossDock"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                <Truck className="h-4 w-4 mr-1 text-gray-400" />
                Cross Dock*
              </FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  // Reset the cross dock form fields if "no" is selected
                  if (value === "no") {
                    form.setValue("crossDockDestination", "");
                    form.setValue("transferWorkOrderNumber", "");
                    form.setValue("trailerNumber", "");
                    form.setValue("etaDate", "");
                    form.setValue("crossDockConfirmation", false);
                  }
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="transition-all border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200">
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
      </div>
      
      {showCrossDockDestination && (
        <Card className="mt-4 p-4 border border-purple-200 bg-purple-50 dark:bg-purple-900/20">
          <div className="mb-4 border-b border-purple-200 pb-2">
            <h4 className="text-md font-medium text-purple-700 dark:text-purple-300 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Cross Dock Form Details
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="crossDockDestination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    Destination Store*
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter cross dock destination" 
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
              name="transferWorkOrderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-gray-400" />
                    Transfer Work Order Number*
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter work order number" 
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
              name="trailerNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Truck className="h-4 w-4 mr-1 text-gray-400" />
                    Trailer Number (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter trailer number" 
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
                          {field.value ? (
                            format(new Date(field.value), "PPP")
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
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                        disabled={(date) => date < today}
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
                  </div>
                </FormItem>
              )}
            />
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center"
              onClick={onPrintForm}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Cross Dock Form
            </Button>
          </div>
        </Card>
      )}
      
      <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Building className="h-4 w-4 text-blue-500" />
          <span>Your order will be processed at <strong>{form.getValues().store || "selected store"}</strong></span>
        </div>
      </div>
    </>
  );
}
