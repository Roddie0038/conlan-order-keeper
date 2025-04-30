
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../order-form-schema";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { CrossDockPaperworkForm } from "../CrossDockPaperworkForm";
import {
  CrossDockHeader,
  CrossDockToggle,
  CrossDockFormDetails,
  StoreInfoDisplay
} from "./cross-dock";

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
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrintForm = useReactToPrint({
    documentTitle: 'Cross_Dock_Form',
    onBeforePrint: () => {
      console.log("Preparing to print Cross Dock form...");
      return Promise.resolve();
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
      <CrossDockHeader />
      <CrossDockToggle form={form} />
      
      {showCrossDockDestination && (
        <CrossDockFormDetails form={form} onPrintForm={handlePrintForm} />
      )}
      
      <StoreInfoDisplay form={form} />
      
      {/* Hidden div for printing */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <CrossDockPaperworkForm form={form} />
        </div>
      </div>
    </>
  );
}
