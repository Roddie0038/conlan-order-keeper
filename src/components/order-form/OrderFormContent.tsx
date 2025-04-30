
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "./order-form-schema";
import { Form } from "@/components/ui/form";
import { ContactSection } from "./sections/ContactSection";
import { ProductSection } from "./sections/ProductSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { CrossDockSection } from "./sections/CrossDockSection";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { CrossDockPaperworkForm } from "./CrossDockPaperworkForm";

interface OrderFormContentProps {
  form: UseFormReturn<OrderFormValues>;
  showCrossDockDestination: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function OrderFormContent({ 
  form, 
  showCrossDockDestination,
  onSubmit 
}: OrderFormContentProps) {
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrintForm = useReactToPrint({
    documentTitle: 'Cross_Dock_Form',
    onBeforePrint: () => {
      console.log("Preparing to print Cross Dock form...");
      return Promise.resolve(); // Return a Promise to satisfy TypeScript
    },
    onPrintError: (error) => {
      console.error('Print failed:', error);
      toast({
        variant: "destructive",
        title: "Print Error",
        description: "Failed to generate Cross Dock form. Please try again."
      });
    },
    onAfterPrint: () => {
      console.log('Cross Dock form printed successfully');
      toast({
        title: "Success",
        description: "Cross Dock form generated successfully!"
      });
    },
    content: () => printRef.current
  } as any); // Cast to any to fix TypeScript issue
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Contact Information */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-100 dark:border-gray-800">
            <ContactSection form={form} />
          </div>
          
          {/* Order Details */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-900/30">
            <ProductSection form={form} />
          </div>
          
          {/* Logistics */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-100 dark:border-green-900/30">
            <ScheduleSection form={form} />
          </div>
          
          {/* Cross Dock */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-100 dark:border-purple-900/30">
            <CrossDockSection 
              form={form} 
              showCrossDockDestination={showCrossDockDestination}
              onPrintForm={handlePrintForm}
            />
          </div>
        </form>
      </Form>
      
      {/* Hidden div for printing */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <CrossDockPaperworkForm form={form} />
        </div>
      </div>
    </>
  );
}
