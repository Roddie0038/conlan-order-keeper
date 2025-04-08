
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stores } from "@/components/order-form/formConfig";
import { Printer, Plus, FileEdit, FileCog } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useToast } from "@/components/ui/use-toast";
import { usePlant } from "@/contexts/PlantContext";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { motion } from "framer-motion";

interface ProductRow {
  id: string;
  productCode: string;
  description: string;
  quantity: string;
}

export const CrossDockForm = () => {
  // State management
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [fromStore, setFromStore] = useState<string>("");
  const [toStore, setToStore] = useState<string>("");
  const [receiverNo, setReceiverNo] = useState<string>("");
  const [products, setProducts] = useState<ProductRow[]>([{
    id: crypto.randomUUID(),
    productCode: "",
    description: "",
    quantity: ""
  }]);
  
  const { toast } = useToast();
  const { currentPlant } = usePlant();
  const printRef = useRef<HTMLDivElement>(null);
  
  // Handle printing
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
    onPrintError: error => {
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
  
  // Print handler
  const onPrintClick = () => {
    if (printRef.current) {
      handlePrint();
    } else {
      toast({
        variant: "destructive",
        title: "Print Error",
        description: "Could not generate PDF. Please try again."
      });
    }
  };

  return (
    <Card className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-4xl mx-auto">
      <div className="print-header print-section" ref={printRef}>
        {/* Form Header with Plant name if available */}
        {currentPlant && (
          <div className="bg-slate-100 p-2 text-center print-hide">
            <span className="text-sm font-medium text-slate-700">
              Currently working with: <span className="font-bold">{currentPlant.name}</span>
            </span>
          </div>
        )}
        
        <div className="text-center space-y-3 p-6 border-b">
          <h2 className="font-bold text-3xl text-gray-800">Cross Dock Form</h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Use this form when sending tires/material to another store using the Warehouse as a cross dock location.
          </p>
        </div>

        <CardContent className="p-6">
          {/* Form Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Date:</label>
              <Input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Receiver No (MaddenCo):</label>
              <Input 
                type="text" 
                value={receiverNo} 
                onChange={e => setReceiverNo(e.target.value)} 
                placeholder="Enter receiver number"
                className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">FROM Store:</label>
              <Select value={fromStore} onValueChange={setFromStore}>
                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">TO Store:</label>
              <Select value={toStore} onValueChange={setToStore}>
                <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Product Details</h3>
            
            <div className="border rounded-lg overflow-hidden">
              <Table className="print-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3 bg-gray-50 font-medium">Product Code</TableHead>
                    <TableHead className="w-1/2 bg-gray-50 font-medium">Description</TableHead>
                    <TableHead className="w-1/6 bg-gray-50 font-medium">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow key={product.id} className="border-t hover:bg-gray-50">
                      <TableCell className="p-2">
                        <Input 
                          type="text" 
                          value={product.productCode}
                          onChange={e => updateProduct(product.id, "productCode", e.target.value)}
                          placeholder="Enter product code"
                          className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input 
                          type="text"
                          value={product.description}
                          onChange={e => updateProduct(product.id, "description", e.target.value)}
                          placeholder="Enter description"
                          className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input 
                          type="number"
                          min="1"
                          value={product.quantity}
                          onChange={e => updateProduct(product.id, "quantity", e.target.value)}
                          placeholder="#"
                          className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-md shadow-sm"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Buttons - Hidden during print */}
      <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-4 print-hide">
        <Button 
          onClick={addRow} 
          variant="outline" 
          className="flex-1 text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
        
        <Button 
          onClick={onPrintClick} 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-[1.01]"
        >
          <Printer className="w-4 h-4 mr-2" />
          Print PDF
        </Button>
      </div>
    </Card>
  );
};
