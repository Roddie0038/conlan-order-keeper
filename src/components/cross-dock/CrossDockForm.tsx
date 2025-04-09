
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useReactToPrint } from "react-to-print";
import { useToast } from "@/hooks/use-toast";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrossDockHeader } from "./components/CrossDockHeader";
import { FormDetails } from "./components/FormDetails";
import { ProductTable, ProductRow } from "./components/ProductTable";
import { motion } from "framer-motion";

export const CrossDockForm = () => {
  // State management
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fromStore, setFromStore] = useState<string>("");
  const [toStore, setToStore] = useState<string>("");
  const [receiverNo, setReceiverNo] = useState<string>("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [products, setProducts] = useState<ProductRow[]>([{
    id: crypto.randomUUID(),
    productCode: "",
    description: "",
    quantity: ""
  }]);
  
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
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
  const updateProduct = (id: string, field: keyof ProductRow, value: string) => {
    setProducts(products.map(product => 
      product.id === id ? {
        ...product,
        [field]: value
      } : product
    ));
  };

  // Handle printing using react-to-print hook
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Cross_Dock_Form',
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
    onBeforePrint: () => {
      console.log("Preparing to print Cross Dock form...");
      setIsPrinting(true);
    },
    onAfterPrint: () => {
      console.log("Print completed successfully");
      setIsPrinting(false);
      toast({
        title: "Success",
        description: "PDF generated successfully!"
      });
    },
    onPrintError: (error: Error) => {
      console.error('Print failed:', error);
      setIsPrinting(false);
      toast({
        variant: "destructive",
        title: "Print Error",
        description: "Failed to generate PDF. Please try again."
      });
    },
  });

  const onPrintClick = () => {
    if (!printRef.current) {
      console.log("Print reference is not available", printRef.current);
      toast({
        variant: "destructive",
        title: "Print Error",
        description: "Could not generate PDF. Please try again."
      });
      return;
    }
    
    console.log("Attempting to print with reference:", printRef.current);
    handlePrint();
  };

  return (
    <Card className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-4xl mx-auto">
      {/* Make sure the entire content to be printed is wrapped with the ref */}
      <div ref={printRef}>
        <CrossDockHeader />
        
        <CardContent className="p-6">
          {/* Form Content */}
          <FormDetails 
            date={date}
            setDate={setDate}
            fromStore={fromStore}
            setFromStore={setFromStore}
            toStore={toStore}
            setToStore={setToStore}
            receiverNo={receiverNo}
            setReceiverNo={setReceiverNo}
          />

          {/* Products Table */}
          <ProductTable 
            products={products} 
            updateProduct={updateProduct} 
            addRow={addRow} 
          />
        </CardContent>
      </div>

      {/* Buttons - Hidden during print */}
      <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-4 print-hide">
        <Button 
          onClick={onPrintClick} 
          disabled={isPrinting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-[1.01]"
        >
          <Printer className="w-4 h-4 mr-2" />
          {isPrinting ? "Generating PDF..." : "Print PDF"}
        </Button>
      </div>
    </Card>
  );
};
