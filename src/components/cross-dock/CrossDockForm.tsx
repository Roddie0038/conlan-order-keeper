
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { stores } from "@/components/order-form/formConfig";
import { Printer, Plus } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

interface ProductRow {
  id: string;
  productCode: string;
  description: string;
  quantity: string;
}

export const CrossDockForm = () => {
  const [date, setDate] = useState("");
  const [fromStore, setFromStore] = useState("");
  const [toStore, setToStore] = useState("");
  const [receiverNo, setReceiverNo] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([
    { id: crypto.randomUUID(), productCode: "", description: "", quantity: "" }
  ]);

  const formRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: 'Cross_Dock_Form',
    content: () => formRef.current,
  });

  const addRow = () => {
    setProducts([
      ...products,
      { id: crypto.randomUUID(), productCode: "", description: "", quantity: "" }
    ]);
  };

  const updateProduct = (id: string, field: keyof ProductRow, value: string) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg print:shadow-none">
      <div ref={formRef} className="space-y-6">
        <div className="text-center space-y-2 print:mb-8">
          <h2 className="text-xl font-bold underline">Cross Dock Form</h2>
          <p className="text-sm text-gray-600">
            This form is used when sending tires/material to another store using the Warehouse as a cross dock location.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Date:</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Receiver No (MaddenCo):</label>
            <Input
              type="text"
              value={receiverNo}
              onChange={(e) => setReceiverNo(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">FROM Store:</label>
            <Select value={fromStore} onValueChange={setFromStore}>
              <SelectTrigger>
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

          <div>
            <label className="block text-sm font-medium mb-1">TO Store:</label>
            <Select value={toStore} onValueChange={setToStore}>
              <SelectTrigger>
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

        <div className="mt-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50 text-left">Product Code</th>
                <th className="border p-2 bg-gray-50 text-left">Description</th>
                <th className="border p-2 bg-gray-50 text-left">Qty</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="border p-2">
                    <Input
                      type="text"
                      value={product.productCode}
                      onChange={(e) => updateProduct(product.id, "productCode", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <Input
                      type="text"
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, "description", e.target.value)}
                    />
                  </td>
                  <td className="border p-2">
                    <Input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProduct(product.id, "quantity", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex gap-4 print:hidden">
        <Button onClick={addRow} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
        <Button onClick={handlePrint} className="w-full bg-blue-600 hover:bg-blue-700">
          <Printer className="w-4 h-4 mr-2" />
          Print PDF
        </Button>
      </div>
    </div>
  );
};
