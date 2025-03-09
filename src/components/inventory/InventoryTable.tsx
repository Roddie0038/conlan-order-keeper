
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { InventoryTableHeader } from "./InventoryTableHeader";
import { InventoryTableRow } from "./InventoryTableRow";
import { useInventory, InventoryItem, SortField } from "@/hooks/useInventory";
import { cn } from "@/lib/utils";

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
    cancelEdit,
    setEditMode,
    sortField,
    sortDirection,
    handleSort,
    getSortedData
  } = useInventory();

  const filteredInventory = (editMode ? editedInventory : inventory).filter(item => 
    item.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFilteredInventory = getSortedData(filteredInventory);

  const SortableColumnHeader = ({ field, label, className }: { field: SortField, label: string, className?: string }) => (
    <TableHead 
      className={cn("cursor-pointer select-none", className)} 
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
        ) : null}
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <InventoryTableHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleAddItem={handleAddItem}
        editMode={editMode}
        setEditMode={setEditMode}
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
                    sortedFilteredInventory.length > 0 && 
                    selectedItems.length === sortedFilteredInventory.length
                  }
                  onCheckedChange={() => handleSelectAll(sortedFilteredInventory)}
                  aria-label="Select all"
                />
              </TableHead>
              <SortableColumnHeader field="productNumber" label="Product #" className="w-[120px]" />
              <SortableColumnHeader field="description" label="Description" className="w-[300px]" />
              <SortableColumnHeader field="quantity" label="Quantity" className="w-[100px]" />
              <SortableColumnHeader field="minThreshold" label="Min Stock" className="w-[100px]" />
              <SortableColumnHeader field="lastUpdated" label="Last Updated" className="w-[150px]" />
              <TableHead className="w-[100px]">Low Stock</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFilteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              sortedFilteredInventory.map(item => (
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
