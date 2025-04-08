
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CrossDockHeader } from "./components/CrossDockHeader";
import { FormDetails } from "./components/FormDetails";
import { ProductTable, ProductRow } from "./components/ProductTable";
import { PrintButton } from "./components/PrintButton";
import { usePrintForm } from "./hooks/usePrintForm";
import { motion } from "framer-motion";

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
  
  const { printRef, onPrintClick } = usePrintForm();
  
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

  return (
    <Card className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-4xl mx-auto">
      <div className="print-header print-section" ref={printRef}>
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
        <PrintButton onPrintClick={onPrintClick} />
      </div>
    </Card>
  );
};
