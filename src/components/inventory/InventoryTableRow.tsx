
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface InventoryItem {
  id: string;
  productNumber: string;
  description: string;
  quantity: number;
  minThreshold: number;
  lastUpdated: string;
  lowStock: boolean;
}

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
    <TableRow key={item.id} className={item.lowStock ? "bg-red-50" : ""}>
      <TableCell>
        <Checkbox 
          checked={selectedItems.includes(item.id)}
          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
          aria-label={`Select item ${item.productNumber}`}
        />
      </TableCell>
      <TableCell>
        {editMode ? (
          <Input 
            value={item.productNumber} 
            onChange={(e) => handleEdit(item.id, "productNumber", e.target.value)}
            className="max-w-[100px]"
          />
        ) : (
          item.productNumber
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
            value={item.minThreshold} 
            onChange={(e) => handleEdit(item.id, "minThreshold", parseInt(e.target.value) || 0)}
            className="max-w-[80px]"
          />
        ) : (
          item.minThreshold
        )}
      </TableCell>
      <TableCell>
        {new Date(item.lastUpdated).toLocaleString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center">
          <Checkbox 
            checked={item.lowStock} 
            onCheckedChange={(checked) => editMode && handleEdit(item.id, "lowStock", !!checked)}
            disabled={!editMode}
            className={item.lowStock ? "bg-red-500 text-white" : ""}
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
          itemName={item.description || item.productNumber}
        />
      </TableCell>
    </TableRow>
  );
}
