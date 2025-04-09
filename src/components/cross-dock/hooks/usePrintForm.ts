
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { generateCrossDockPDF } from "@/utils/pdf/generateCrossDockPDF";

/**
 * Hook for handling PDF printing in Cross Dock forms
 * @returns Object containing printRef and onPrintClick function
 */
export const usePrintForm = () => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  /**
   * Handles the print button click
   * @returns Promise that resolves when printing is complete
   */
  const onPrintClick = async (): Promise<void> => {
    if (!printRef.current) {
      toast({
        variant: "destructive",
        title: "Print Error",
        description: "Could not generate PDF. Please try again."
      });
      return Promise.reject(new Error("Print reference is not available"));
    }
    
    try {
      // Call the PDF generation utility with the current content
      await generateCrossDockPDF({
        content: printRef.current,
        documentTitle: 'Cross_Dock_Form'
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error in print handler:", error);
      return Promise.reject(error);
    }
  };

  return { printRef, onPrintClick };
};
