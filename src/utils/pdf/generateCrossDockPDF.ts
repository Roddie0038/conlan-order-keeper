
import { toast } from "@/hooks/use-toast";

interface PrintOptions {
  content: HTMLElement | null;
  documentTitle?: string;
}

/**
 * Generates a PDF from an HTML element
 * @param options PrintOptions object containing content and optional documentTitle
 * @returns Promise that resolves when PDF generation is complete
 */
export const generateCrossDockPDF = async (options: PrintOptions): Promise<void> => {
  const { content, documentTitle = 'Cross_Dock_Form' } = options;
  
  if (!content) {
    toast({
      variant: "destructive",
      title: "Print Error",
      description: "Could not generate PDF. No content available."
    });
    return Promise.reject(new Error("No content available for printing"));
  }

  try {
    // Dynamically import react-to-print to avoid SSR issues
    const { useReactToPrint } = await import("react-to-print");
    
    // Define print styles
    const pageStyle = `
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
    `;

    return new Promise<void>((resolve, reject) => {
      // Since we can't use hooks outside of components,
      // we'll use the direct print function from the library
      const printMethod = require('react-to-print');
      
      if (!printMethod || !printMethod.default) {
        reject(new Error("Print library not available"));
        return;
      }
      
      const printFn = printMethod.default({
        content: () => content,
        documentTitle,
        pageStyle,
        onBeforePrint: () => {
          console.log("Preparing to print Cross Dock form...");
        },
        onPrintError: (error: Error) => {
          console.error('Print failed:', error);
          toast({
            variant: "destructive",
            title: "Print Error",
            description: "Failed to generate PDF. Please try again."
          });
          reject(error);
        },
        onAfterPrint: () => {
          toast({
            title: "Success",
            description: "PDF generated successfully!"
          });
          resolve();
        },
      });
      
      // Execute the print function
      printFn();
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    toast({
      variant: "destructive",
      title: "Print Error",
      description: "Failed to generate PDF. Please try again."
    });
    return Promise.reject(error);
  }
};
