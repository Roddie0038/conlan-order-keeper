
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ImportItem } from "../types";

interface ImportItemsTableProps {
  importItems: ImportItem[];
  handleSelectAll: (checked: boolean) => void;
  handleSelectItem: (id: string, checked: boolean) => void;
}

export function ImportItemsTable({ 
  importItems,
  handleSelectAll,
  handleSelectItem 
}: ImportItemsTableProps) {
  const allSelected = importItems.length > 0 && importItems.every(item => item.selected);
  
  return (
    <div className="overflow-y-auto max-h-[60vh]">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[50px]">
              <Checkbox 
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Product #</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Min Stock</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {importItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                No items found in this document
              </TableCell>
            </TableRow>
          ) : (
            importItems.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <Checkbox 
                    checked={item.selected}
                    onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                  />
                </TableCell>
                <TableCell>{item.product_number}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.min_threshold}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
