
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useToast } from "@/components/ui/use-toast";

export const usePrintForm = () => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  // Handle printing - properly typed for async operation
  const handlePrint = useReactToPrint({
    pageStyle: `
      @page { 
        size: letter portrait;
        margin: 0.5in; 
      }
      @media print {
        body { 
          font-family: 'Arial', sans-serif;
          color: #000;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
        }
        .print-table th, .print-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .print-table th {
          background-color: #f8f8f8;
          font-weight: bold;
        }
        .print-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .print-section {
          margin-bottom: 20px;
        }
        .print-hide {
          display: none !important;
        }
      }
    `,
    documentTitle: 'Cross_Dock_Form',
    onBeforePrint: () => {
      console.log("Preparing to print Cross Dock form...");
    },
    onPrintError: (error) => {
      console.error('Print failed:', error);
      toast({
        variant: "destructive",
        title: "Print Error",
        description: "Failed to generate PDF. Please try again."
      });
    },
    onAfterPrint: () => {
      toast({
        title: "Success",
        description: "PDF generated successfully!"
      });
    },
    content: () => printRef.current
  });

  // Ensuring onPrintClick returns a Promise<void> in all code paths
  const onPrintClick = async (): Promise<void> => {
    if (!printRef.current) {
      toast({
        variant: "destructive",
        title: "Print Error",
        description: "Could not generate PDF. Please try again."
      });
      return Promise.resolve();
    }
    
    // Call handlePrint and return a promise
    return new Promise<void>((resolve) => {
      handlePrint();
      resolve();
    });
  };

  return { printRef, onPrintClick };
};
