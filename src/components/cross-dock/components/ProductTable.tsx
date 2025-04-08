
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export interface ProductRow {
  id: string;
  productCode: string;
  description: string;
  quantity: string;
}

interface ProductTableProps {
  products: ProductRow[];
  updateProduct: (id: string, field: keyof ProductRow, value: string) => void;
  addRow: () => void;
}

export const ProductTable = ({ products, updateProduct, addRow }: ProductTableProps) => {
  return (
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
      
      <div className="mt-4">
        <Button 
          onClick={addRow} 
          variant="outline" 
          className="flex-1 text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Row
        </Button>
      </div>
    </div>
  );
};
