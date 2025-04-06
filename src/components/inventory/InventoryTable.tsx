
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Package2, AlertTriangle } from "lucide-react";
import { InventoryTableHeader } from "./InventoryTableHeader";
import { InventoryTableRow } from "./InventoryTableRow";
import { useInventory, SortField } from "@/hooks/useInventory";
import { cn } from "@/lib/utils";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { toast } = useToast();
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

  // Add effect to show toast when inventory is updated via real-time
  useEffect(() => {
    // We don't want to show this on initial load
    if (!loading && inventory.length > 0) {
      const timeoutId = setTimeout(() => {
        // This will only run after component has been mounted and data loaded
        console.log('Inventory table component ready for real-time updates');
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [inventory, loading]);

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
      className={cn("cursor-pointer select-none font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors", className)} 
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        {sortField === field ? (
          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
        ) : (
          <ChevronDown size={16} className="opacity-20" />
        )}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center h-64 border border-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Loading inventory data...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load inventory</h3>
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={refreshInventory}
          className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4 shadow-sm">
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
      </Card>

      <DeleteConfirmationDialog
        isOpen={showBulkDeleteDialog}
        setIsOpen={setShowBulkDeleteDialog}
        onConfirm={handleConfirmBulkDelete}
        itemCount={selectedItems.length}
      />

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100 dark:bg-slate-800 border-b-2 border-slate-200">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={
                    sortedFilteredInventory.length > 0 && 
                    selectedItems.length === sortedFilteredInventory.length
                  }
                  onCheckedChange={() => handleSelectAll(sortedFilteredInventory)}
                  aria-label="Select all"
                  className="border-indigo-300"
                />
              </TableHead>
              <SortableColumnHeader field="product_number" label="Product #" className="w-[120px]" />
              <SortableColumnHeader field="description" label="Description" className="w-[300px]" />
              <SortableColumnHeader field="quantity" label="Quantity" className="w-[100px]" />
              <SortableColumnHeader field="min_threshold" label="Min Stock" className="w-[100px]" />
              <SortableColumnHeader field="last_updated" label="Last Updated" className="w-[150px]" />
              <TableHead className="w-[100px] font-semibold text-indigo-700 dark:text-indigo-300">Status</TableHead>
              <TableHead className="w-[70px] font-semibold text-indigo-700 dark:text-indigo-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedFilteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Package2 className="h-12 w-12 text-gray-300" />
                    <p className="font-medium">No inventory items found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search or add a new item</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedFilteredInventory.map((item, index) => (
                <InventoryTableRow
                  key={item.id}
                  item={item}
                  editMode={editMode}
                  selectedItems={selectedItems}
                  handleSelectItem={handleSelectItem}
                  handleEdit={handleEdit}
                  handleDeleteItem={handleDeleteItem}
                  isEvenRow={index % 2 === 0}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {inventory.some(item => item.low_stock) && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <strong className="font-semibold">Attention Required:</strong> Some items are below minimum stock threshold. Please reorder soon.
          </div>
        </div>
      )}
    </div>
  );
}
