
import { useInventoryContext } from "@/contexts/InventoryContext";
import { useSortInventory } from "./inventory/useSortInventory";
import { useInventorySelection } from "./inventory/useInventorySelection";
import { useInventoryEdit } from "./inventory/useInventoryEdit";
import { useInventorySubscription } from "./inventory/useInventorySubscription";

export function useInventory() {
  const { 
    inventory,
    loading,
    error,
    refreshInventory,
    deleteInventoryItem,
    deleteMultipleItems
  } = useInventoryContext();
  
  // Set up realtime subscriptions
  useInventorySubscription(refreshInventory);

  // Sort functionality
  const { sortField, sortDirection, handleSort, getSortedData } = useSortInventory();
  
  // Selection functionality
  const { selectedItems, setSelectedItems, handleSelectItem, handleSelectAll } = useInventorySelection();
  
  // Edit functionality
  const { 
    editMode, 
    editedInventory, 
    setEditMode, 
    handleAddItem, 
    handleSaveChanges, 
    handleEdit,
    handleDeleteItem: handleItemDelete,
    cancelEdit,
    handleAddImportedItems
  } = useInventoryEdit();

  // Wrapper for handleDeleteItem to handle selection state
  const handleDeleteItem = (id: string) => {
    handleItemDelete(id);
    // Clear selection if item was selected
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) return;

    if (editMode) {
      setEditedInventory(prev => prev.filter(item => !selectedItems.includes(item.id)));
    } else {
      deleteMultipleItems(selectedItems);
    }
    // Clear selection after delete
    setSelectedItems([]);
  };

  return {
    inventory,
    loading,
    error,
    editMode,
    editedInventory,
    selectedItems,
    setSelectedItems,
    setEditMode,
    sortField,
    sortDirection,
    handleSort,
    getSortedData,
    handleAddItem,
    handleSaveChanges,
    handleEdit,
    handleDeleteItem,
    handleSelectItem,
    handleSelectAll,
    handleDeleteSelected,
    cancelEdit,
    handleAddImportedItems,
    refreshInventory
  };
}

// Re-export types for convenience
export type { SortField, SortDirection } from './inventory/useSortInventory';
