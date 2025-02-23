
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export interface ProductRow {
  productCode: string;
  description: string;
  quantity: string;
}

interface ProductTableProps {
  products: ProductRow[];
  onProductsChange: (products: ProductRow[]) => void;
}

export const ProductTable = ({ products, onProductsChange }: ProductTableProps) => {
  const addRow = () => {
    onProductsChange([
      ...products,
      { productCode: "", description: "", quantity: "" }
    ]);
  };

  const updateProduct = (index: number, field: keyof ProductRow, value: string) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    onProductsChange(newProducts);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  type="text"
                  value={product.productCode}
                  onChange={(e) => updateProduct(index, "productCode", e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="text"
                  value={product.description}
                  onChange={(e) => updateProduct(index, "description", e.target.value)}
                  className="w-full"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="1"
                  value={product.quantity}
                  onChange={(e) => updateProduct(index, "quantity", e.target.value)}
                  className="w-full"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button 
        type="button" 
        onClick={addRow}
        variant="outline"
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Row
      </Button>
    </div>
  );
};
