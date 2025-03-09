
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { InventoryItem } from "@/contexts/InventoryContext";

interface InventoryTableRowProps {
  item: InventoryItem;
  editMode: boolean;
  selectedItems: string[];
  handleSelectItem: (id: string, checked: boolean) => void;
  handleEdit: (id: string, field: keyof InventoryItem, value: string | number | boolean) => void;
  handleDeleteItem: (id: string) => void;
}

export function InventoryTableRow({
  item,
  editMode,
  selectedItems,
  handleSelectItem,
  handleEdit,
  handleDeleteItem
}: InventoryTableRowProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleConfirmDelete = () => {
    handleDeleteItem(item.id);
    setShowDeleteDialog(false);
  };

  return (
    <TableRow key={item.id} className={item.low_stock ? "bg-red-50" : ""}>
      <TableCell>
        <Checkbox 
          checked={selectedItems.includes(item.id)}
          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
          aria-label={`Select item ${item.product_number}`}
        />
      </TableCell>
      <TableCell>
        {editMode ? (
          <Input 
            value={item.product_number} 
            onChange={(e) => handleEdit(item.id, "product_number", e.target.value)}
            className="max-w-[100px]"
          />
        ) : (
          item.product_number
        )}
      </TableCell>
      <TableCell>
        {editMode ? (
          <Input 
            value={item.description} 
            onChange={(e) => handleEdit(item.id, "description", e.target.value)}
          />
        ) : (
          item.description
        )}
      </TableCell>
      <TableCell>
        {editMode ? (
          <Input 
            type="number"
            value={item.quantity} 
            onChange={(e) => handleEdit(item.id, "quantity", parseInt(e.target.value) || 0)}
            className="max-w-[80px]"
          />
        ) : (
          item.quantity
        )}
      </TableCell>
      <TableCell>
        {editMode ? (
          <Input 
            type="number"
            value={item.min_threshold} 
            onChange={(e) => handleEdit(item.id, "min_threshold", parseInt(e.target.value) || 0)}
            className="max-w-[80px]"
          />
        ) : (
          item.min_threshold
        )}
      </TableCell>
      <TableCell>
        {new Date(item.last_updated).toLocaleString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Checkbox 
            checked={item.low_stock} 
            onCheckedChange={(checked) => editMode && handleEdit(item.id, "low_stock", !!checked)}
            disabled={!editMode}
            className={item.low_stock ? "bg-red-500 text-white" : ""}
          />
        </div>
      </TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDeleteDialog(true)}
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
      </TableCell>
    </TableRow>
  );
}
