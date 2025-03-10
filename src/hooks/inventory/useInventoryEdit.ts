
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InventoryItem, InventoryItemUpdateData } from '@/types/inventory';
import { useInventoryContext } from '@/contexts/InventoryContext';

export function useInventoryEdit() {
  const { 
    inventory,
    updateInventoryItem,
    addInventoryItems: addItems,
    deleteInventoryItem: contextDeleteItem,
    deleteMultipleItems,
    refreshInventory
  } = useInventoryContext();
  
  const [editMode, setEditMode] = useState(false);
  const [editedInventory, setEditedInventory] = useState<InventoryItem[]>([]);
  const { toast } = useToast();

  const handleAddItem = () => {
    const newItem: InventoryItem = {
      id: crypto.randomUUID(),
      product_number: "",
      description: "",
      quantity: 0,
      min_threshold: 5,
      last_updated: new Date().toISOString(),
      low_stock: false
    };
    
    setEditedInventory([...editedInventory.length ? editedInventory : inventory, newItem]);
    setEditMode(true);
  };

  const handleEdit = (id: string, field: keyof InventoryItem, value: string | number | boolean) => {
    setEditedInventory(prev => 
      prev.map(item => {
        if (item.id !== id) return item;
        
        // Create updated item with the new field value
        return { 
          ...item, 
          [field]: value,
        };
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    // Don't delete in edit mode - wait for save
    if (editMode) {
      setEditedInventory(prev => prev.filter(item => item.id !== id));
    } else {
      // Delete immediately in view mode
      try {
        contextDeleteItem(id);
      } catch (error) {
        console.error("Error deleting item:", error);
        toast({
          title: "Error",
          description: "Failed to delete inventory item. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveChanges = async () => {
    // Find items that were modified
    const originalItemsMap = new Map(inventory.map(item => [item.id, item]));
    const itemsToUpdate = [];
    const newItems = [];

    for (const editedItem of editedInventory) {
      const originalItem = originalItemsMap.get(editedItem.id);
      
      // This is a new item
      if (!originalItem) {
        newItems.push({
          product_number: editedItem.product_number,
          description: editedItem.description,
          quantity: editedItem.quantity,
          min_threshold: editedItem.min_threshold
        });
        continue;
      }
      
      // Check if item was modified
      if (
        originalItem.product_number !== editedItem.product_number ||
        originalItem.description !== editedItem.description ||
        originalItem.quantity !== editedItem.quantity ||
        originalItem.min_threshold !== editedItem.min_threshold
      ) {
        // Update this item
        itemsToUpdate.push({
          id: editedItem.id,
          data: {
            product_number: editedItem.product_number,
            description: editedItem.description,
            quantity: editedItem.quantity,
            min_threshold: editedItem.min_threshold,
          } as InventoryItemUpdateData
        });
      }
    }

    // Process deletions (items in original inventory but not in edited inventory)
    const editedIds = new Set(editedInventory.map(item => item.id));
    const deletedIds = inventory
      .filter(item => !editedIds.has(item.id))
      .map(item => item.id);

    try {
      // Process updates
      for (const {id, data} of itemsToUpdate) {
        await updateInventoryItem(id, data);
      }
      
      // Process additions
      if (newItems.length > 0) {
        await addItems(newItems);
      }
      
      // Process deletions
      if (deletedIds.length > 0) {
        await deleteMultipleItems(deletedIds);
      }
      
      // Refresh inventory data
      await refreshInventory();
      
      toast({
        title: "Inventory Updated",
        description: `Updated ${itemsToUpdate.length} items, added ${newItems.length} items, and removed ${deletedIds.length} items.`
      });
      
      setEditMode(false);
    } catch (error) {
      console.error("Error saving inventory changes:", error);
      toast({
        title: "Error",
        description: "Failed to save inventory changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedInventory(JSON.parse(JSON.stringify(inventory)));
  };

  const handleAddImportedItems = async (importedItems: Omit<InventoryItem, 'id' | 'last_updated' | 'low_stock'>[]) => {
    try {
      await addItems(importedItems);
    } catch (error) {
      console.error("Error importing items:", error);
      toast({
        title: "Import Error",
        description: "Failed to import inventory items. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    editMode,
    editedInventory: editedInventory.length ? editedInventory : inventory,
    setEditMode,
    handleAddItem,
    handleSaveChanges,
    handleEdit,
    handleDeleteItem,
    cancelEdit,
    handleAddImportedItems
  };
}
