
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { InventoryTableHeader } from "./InventoryTableHeader";
import { InventoryTableRow } from "./InventoryTableRow";
import { useInventory, SortField } from "@/hooks/useInventory";
import { cn } from "@/lib/utils";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

export function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const {
    inventory,
    loading,
    error,
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
    getSortedData,
    refreshInventory
  } = useInventory();

  // Filter inventory based on search term
  const filteredInventory = (editMode ? editedInventory : inventory).filter(item => 
    item.product_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedFilteredInventory = getSortedData(filteredInventory);

  const handleConfirmBulkDelete = () => {
    handleDeleteSelected();
    setShowBulkDeleteDialog(false);
  };

  const handleBulkDeleteClick = () => {
    if (selectedItems.length > 0) {
      setShowBulkDeleteDialog(true);
    }
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500">Loading inventory data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load inventory</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={refreshInventory}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

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
        handleDeleteSelected={handleBulkDeleteClick}
        inventory={inventory}
      />

      <DeleteConfirmationDialog
        isOpen={showBulkDeleteDialog}
        setIsOpen={setShowBulkDeleteDialog}
        onConfirm={handleConfirmBulkDelete}
        itemCount={selectedItems.length}
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
              <SortableColumnHeader field="product_number" label="Product #" className="w-[120px]" />
              <SortableColumnHeader field="description" label="Description" className="w-[300px]" />
              <SortableColumnHeader field="quantity" label="Quantity" className="w-[100px]" />
              <SortableColumnHeader field="min_threshold" label="Min Stock" className="w-[100px]" />
              <SortableColumnHeader field="last_updated" label="Last Updated" className="w-[150px]" />
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
      
      {inventory.some(item => item.low_stock) && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
          <strong>Attention:</strong> Some items are below minimum stock threshold. Please reorder soon.
        </div>
      )}
    </div>
  );
}
