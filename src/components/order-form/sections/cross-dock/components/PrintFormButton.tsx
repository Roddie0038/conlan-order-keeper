
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "@/components/order-form/order-form-schema";
import { CrossDockPaperworkForm } from "@/components/order-form/CrossDockPaperworkForm";
import { useToast } from "@/components/ui/use-toast";

interface PrintFormButtonProps {
  form: UseFormReturn<OrderFormValues>;
}

export function PrintFormButton({ form }: PrintFormButtonProps) {
  const printComponentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrintForm = useReactToPrint({
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
    <>
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        className="flex items-center border-purple-300 hover:bg-purple-100 text-purple-700 dark:text-purple-300 w-full md:w-auto"
        onClick={(e) => {
          e.preventDefault(); // Prevent form submission
          handlePrintForm(() => printComponentRef.current);
        }}
      >
        <Printer className="h-4 w-4 mr-1" />
        Print Form
      </Button>
      
      {/* Hidden div that contains the printable form */}
      <div className="hidden">
        <div ref={printComponentRef} className="p-8 bg-white">
          <CrossDockPaperworkForm form={form} />
        </div>
      </div>
    </>
  );
}
