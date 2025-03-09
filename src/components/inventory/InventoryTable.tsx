
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, Trash2 } from "lucide-react";
import { InventoryTableHeader } from "./InventoryTableHeader";
import { InventoryTableRow } from "./InventoryTableRow";
import { useInventory, InventoryItem } from "@/hooks/useInventory";

export function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    inventory,
    editMode,
    editedInventory,
    selectedItems,
    handleAddItem,
    handleSaveChanges,
    handleEdit,
    handleDeleteItem,
    handleSelectItem,
    handleSelectAll,
    handleDeleteSelected,
    cancelEdit
  } = useInventory();

  const filteredInventory = (editMode ? editedInventory : inventory).filter(item => 
    item.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <InventoryTableHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleAddItem={handleAddItem}
        editMode={editMode}
        setEditMode={(mode) => setEditMode(mode)}
        handleSaveChanges={handleSaveChanges}
        cancelEdit={cancelEdit}
        selectedItems={selectedItems}
        handleDeleteSelected={handleDeleteSelected}
        inventory={inventory}
      />

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={
                    filteredInventory.length > 0 && 
                    selectedItems.length === filteredInventory.length
                  }
                  onCheckedChange={() => handleSelectAll(filteredInventory)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="w-[120px]">Product #</TableHead>
              <TableHead className="w-[300px]">Description</TableHead>
              <TableHead className="w-[100px]">Quantity</TableHead>
              <TableHead className="w-[100px]">Min Stock</TableHead>
              <TableHead className="w-[150px]">Last Updated</TableHead>
              <TableHead className="w-[100px]">Low Stock</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map(item => (
                <InventoryTableRow
                  key={item.id}
                  item={item}
                  editMode={editMode}
                  selectedItems={selectedItems}
                  handleSelectItem={handleSelectItem}
                  handleEdit={handleEdit}
                  handleDeleteItem={handleDeleteItem}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {inventory.some(item => item.lowStock) && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
          <strong>Attention:</strong> Some items are below minimum stock threshold. Please reorder soon.
        </div>
      )}
    </div>
  );
}
