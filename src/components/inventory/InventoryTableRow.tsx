
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, AlertTriangle } from "lucide-react";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { InventoryItem } from "@/contexts/InventoryContext";
import { useInventoryContext } from "@/contexts/InventoryContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface InventoryTableRowProps {
  item: InventoryItem;
  editMode: boolean;
  selectedItems: string[];
  handleSelectItem: (id: string, checked: boolean) => void;
  handleEdit: (id: string, field: keyof InventoryItem, value: string | number | boolean) => void;
  handleDeleteItem: (id: string) => void;
  isEvenRow?: boolean;
}

export function InventoryTableRow({
  item,
  editMode,
  selectedItems,
  handleSelectItem,
  handleEdit,
  handleDeleteItem,
  isEvenRow = false
}: InventoryTableRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isAdmin } = useInventoryContext();

  const handleConfirmDelete = () => {
    handleDeleteItem(item.id);
    setShowDeleteDialog(false);
  };

  // Function to determine quantity color based on stock levels
  const getQuantityColorClass = (quantity: number) => {
    if (quantity <= 0) return "text-red-600 font-bold";
    if (quantity < 5) return "text-orange-500 font-semibold";
    if (quantity >= 20) return "text-green-600 font-semibold";
    return "text-gray-800";
  };

  // Format the last updated date in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TableRow 
      key={item.id} 
      className={cn(
        "border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
        item.low_stock ? "bg-red-50/50 dark:bg-red-900/20" : isEvenRow ? "bg-gray-50/50 dark:bg-gray-800/30" : "",
      )}
    >
      <TableCell className="p-3">
        {isAdmin && (
          <Checkbox 
            checked={selectedItems.includes(item.id)}
            onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
            aria-label={`Select item ${item.product_number}`}
            className="border-indigo-300"
          />
        )}
      </TableCell>
      <TableCell className="p-3 font-medium">
        {editMode && isAdmin ? (
          <Input 
            value={item.product_number} 
            onChange={(e) => handleEdit(item.id, "product_number", e.target.value)}
            className="max-w-[100px] border-indigo-200 focus:border-indigo-400"
          />
        ) : (
          <span className="text-base text-slate-800 dark:text-slate-200">{item.product_number}</span>
        )}
      </TableCell>
      <TableCell className="p-3">
        {editMode && isAdmin ? (
          <Input 
            value={item.description} 
            onChange={(e) => handleEdit(item.id, "description", e.target.value)}
            className="border-indigo-200 focus:border-indigo-400"
          />
        ) : (
          <span className="text-base">{item.description}</span>
        )}
      </TableCell>
      <TableCell className="p-3">
        {editMode && isAdmin ? (
          <Input 
            type="number"
            value={item.quantity} 
            onChange={(e) => handleEdit(item.id, "quantity", parseInt(e.target.value) || 0)}
            className="max-w-[80px] border-indigo-200 focus:border-indigo-400"
          />
        ) : (
          <span className={cn("text-base font-semibold", getQuantityColorClass(item.quantity))}>
            {item.quantity}
          </span>
        )}
      </TableCell>
      <TableCell className="p-3 text-center">
        {/* Min threshold is now always 0 */}
        <Badge variant="outline" className="bg-slate-100 text-slate-700">0</Badge>
      </TableCell>
      <TableCell className="p-3">
        <span className="text-sm text-gray-500">{formatDate(item.last_updated)}</span>
      </TableCell>
      <TableCell className="p-3">
        {item.low_stock ? (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle size={12} />
            Low Stock
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            In Stock
          </Badge>
        )}
      </TableCell>
      <TableCell className="p-3">
        {isAdmin && (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 h-8 w-8"
            >
              <Trash2 size={16} />
            </Button>
            
            <DeleteConfirmationDialog
              isOpen={showDeleteDialog}
              setIsOpen={setShowDeleteDialog}
              onConfirm={handleConfirmDelete}
              itemCount={1}
              itemName={item.description || item.product_number}
            />
          </>
        )}
      </TableCell>
    </TableRow>
  );
}
