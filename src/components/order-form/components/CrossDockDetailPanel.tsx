import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../order-form-schema";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, FileInput, Printer } from "lucide-react";
import { useState } from "react";
import { generateCrossDockPDF } from "../utils/pdfGenerator";
interface CrossDockDetailPanelProps {
  form: UseFormReturn<OrderFormValues>;
}
export function CrossDockDetailPanel({
  form
}: CrossDockDetailPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      form.setValue("crossDockFile", event.target.files[0].name);
    }
  };
  const handlePrintCrossDockForm = () => {
    const formData = form.getValues();
    generateCrossDockPDF(formData);
  };
  return <div className="mt-6 p-5 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800/40">
      <h4 className="text-lg font-medium mb-4 text-purple-800 dark:text-purple-300">Cross Dock Details</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField control={form.control} name="transferWorkOrderNumber" render={({
        field
      }) => <FormItem>
              <FormLabel>Receiver No (MaddenCo):</FormLabel>
              <FormControl>
                <Input placeholder="Enter work order number" {...field} className="border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200" />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        
        <FormField control={form.control} name="trailerNumber" render={({
        field
      }) => <FormItem>
              <FormLabel>Trailer Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter trailer number (optional)" {...field} className="border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-200" />
              </FormControl>
              <FormMessage />
            </FormItem>} />
        
        <FormField control={form.control} name="eta" render={({
        field
      }) => <FormItem className="flex flex-col">
              <FormLabel>ETA (Estimated Arrival)*</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined} onSelect={date => field.onChange(date?.toISOString())} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>} />
        
        <FormItem className="flex flex-col">
          <FormLabel>File Upload (Optional)</FormLabel>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="fileUpload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer hover:border-purple-400 border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileInput className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    <span className="font-semibold">Click to upload</span> or drag and drop files
                  </p>
                </div>
                <input id="fileUpload" type="file" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            {file && <p className="text-sm text-gray-600 dark:text-gray-400">
                Selected file: {file.name}
              </p>}
          </div>
        </FormItem>
      </div>
      
      <div className="mt-6 space-y-4">
        <FormField control={form.control} name="crossDockConfirmation" render={({
        field
      }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>I confirm paperwork is printed and attached*</FormLabel>
                <FormDescription>
                  This ensures all documentation is complete before submission
                </FormDescription>
              </div>
            </FormItem>} />

        <Button type="button" variant="outline" onClick={handlePrintCrossDockForm} className="flex items-center space-x-2">
          <Printer className="w-4 h-4" />
          <span>Print Cross Dock Form</span>
        </Button>
      </div>
    </div>;
}