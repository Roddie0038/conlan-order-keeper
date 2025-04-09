
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useToast } from "@/hooks/use-toast";
import { Printer, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import html2pdf from "html2pdf.js";

export const CrossDockForm = () => {
  // State management
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fromStore, setFromStore] = useState<string>("");
  const [toStore, setToStore] = useState<string>("");
  const [receiverNo, setReceiverNo] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [products, setProducts] = useState<Array<{id: string, productCode: string, description: string, quantity: string}>>([{
    id: crypto.randomUUID(),
    productCode: "",
    description: "",
    quantity: ""
  }]);
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Print using react-to-print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Cross_Dock_Form",
    pageStyle: `
      @page { margin: 0.5in; }
      @media print {
        body { font-family: Arial, sans-serif; color: #000; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
        .no-print { display: none; }
      }
    `,
    onBeforePrint: () => {
      console.log("Preparing to print Cross Dock form...");
      setIsPrinting(true);
    },
    onAfterPrint: () => {
      console.log("Print completed successfully");
      setIsPrinting(false);
      toast({
        title: "Success",
        description: "Form sent to printer!"
      });
    },
    onPrintError: (errorLocation, error) => {
      console.error(`Print failed at ${errorLocation}:`, error);
      setIsPrinting(false);
      toast({
        variant: "destructive",
        title: "Print Error",
        description: "Failed to print. Please try again."
      });
    },
  });

  // Download as PDF using html2pdf.js
  const handleDownloadPDF = async () => {
    if (!printRef.current) {
      toast({ 
        variant: "destructive", 
        title: "Download Error", 
        description: "Form not ready to export." 
      });
      return;
    }

    setIsPrinting(true);
    
    const opt = {
      margin: 0.5,
      filename: 'Cross_Dock_Form.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().from(printRef.current).set(opt).save();
      toast({ 
        title: "Success", 
        description: "PDF downloaded successfully!" 
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "PDF Error",
        description: "Failed to generate PDF. Please try again."
      });
    } finally {
      setIsPrinting(false);
    }
  };

  // Add a new product row
  const addRow = () => {
    setProducts([...products, {
      id: crypto.randomUUID(),
      productCode: "",
      description: "",
      quantity: ""
    }]);
  };
  
  // Update a product field
  const updateProduct = (id: string, field: 'productCode' | 'description' | 'quantity', value: string) => {
    setProducts(products.map(product => 
      product.id === id ? {
        ...product,
        [field]: value
      } : product
    ));
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-4xl mx-auto">
      <div className="flex justify-between p-6 bg-gray-50 border-b">
        <h2 className="text-2xl font-bold text-gray-800">Cross Dock Form</h2>
        <div className="flex gap-2">
          <Button 
            onClick={handlePrint} 
            disabled={isPrinting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            {isPrinting ? "Printing..." : "Print Form"}
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isPrinting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isPrinting ? "Downloading..." : "Download PDF"}
          </Button>
        </div>
      </div>

      <div ref={printRef} className="p-6">
        <h3 className="text-xl font-semibold text-center mb-4">CROSS DOCK FORM</h3>
        <p className="mb-4 text-gray-600 text-sm">
          This form is used when sending tires/material to another store using the Warehouse as a cross dock location.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-medium text-sm mb-1">Date:</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded p-2 w-full"
            />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">Receiver No. (MaddenCo):</label>
            <input 
              type="text" 
              value={receiverNo}
              onChange={(e) => setReceiverNo(e.target.value)}
              className="border rounded p-2 w-full" 
            />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">From Store:</label>
            <input 
              type="text" 
              value={fromStore}
              onChange={(e) => setFromStore(e.target.value)}
              className="border rounded p-2 w-full" 
            />
          </div>
          <div>
            <label className="block font-medium text-sm mb-1">To Store:</label>
            <input 
              type="text" 
              value={toStore}
              onChange={(e) => setToStore(e.target.value)}
              className="border rounded p-2 w-full" 
            />
          </div>
        </div>

        <table className="w-full text-sm border mt-6">
          <thead>
            <tr>
              <th className="bg-gray-100 p-2 text-left">Product Code</th>
              <th className="bg-gray-100 p-2 text-left">Description</th>
              <th className="bg-gray-100 p-2 text-left">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-2">
                  <input 
                    type="text" 
                    value={product.productCode}
                    onChange={(e) => updateProduct(product.id, 'productCode', e.target.value)}
                    className="w-full p-1 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="text" 
                    value={product.description}
                    onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                    className="w-full p-1 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded"
                  />
                </td>
                <td className="p-2">
                  <input 
                    type="text"
                    value={product.quantity} 
                    onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                    className="w-full p-1 border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 no-print">
          <Button 
            onClick={addRow}
            variant="outline" 
            className="text-sm"
          >
            + Add Another Row
          </Button>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Note: Please make sure all product information is accurate before printing or downloading.</p>
        </div>
      </div>
    </div>
  );
};

export default CrossDockForm;
