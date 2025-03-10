import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useInventoryContext, InventoryItem } from "@/contexts/InventoryContext";
import { supabase } from "@/integrations/supabase/client";

export type SortField = 'product_number' | 'description' | 'quantity' | 'min_threshold' | 'last_updated';
export type SortDirection = 'asc' | 'desc';

export function useInventory() {
  const { 
    inventory,
    loading,
    error,
    refreshInventory,
    addInventoryItems: addItems,
    updateInventoryItem,
    deleteInventoryItem,
    deleteMultipleItems
  } = useInventoryContext();
  
  const [editMode, setEditMode] = useState(false);
  const [editedInventory, setEditedInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();

  // Set up real-time updates
  useEffect(() => {
    console.log('Setting up real-time updates for inventory items');
    
    // Subscribe to all changes to inventory_items table
    const channel = supabase.channel('inventory-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        (payload) => {
          console.log('Real-time inventory update received:', payload);
          refreshInventory();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Cleanup function
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [refreshInventory]);

  // You can also set up a filtered channel for low stock items
  useEffect(() => {
    console.log('Setting up filtered real-time updates for low stock items');
    
    const lowStockChannel = supabase.channel('low-stock-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'inventory_items',
          filter: 'low_stock=eq.true' 
        },
        (payload) => {
          console.log('Low stock item updated:', payload);
          // You could display a special notification for low stock changes
          toast({
            title: "Low Stock Alert",
            description: "An item with low stock has been updated",
            variant: "destructive"
          });
          refreshInventory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lowStockChannel);
    };
  }, [refreshInventory, toast]);

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const getSortedData = (data: InventoryItem[]) => {
    if (!sortField) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // For numeric fields
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });
  };

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
          }
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
      deleteInventoryItem(id);
    }
    // Clear selection if item was selected
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, id]);
    } else {
      setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    }
  };

  const handleSelectAll = (filteredItems: InventoryItem[]) => {
    const currentItems = filteredItems.map(item => item.id);
    
    if (selectedItems.length === currentItems.length) {
      // If all are selected, deselect all
      setSelectedItems([]);
    } else {
      // Otherwise, select all filtered items
      setSelectedItems(currentItems);
    }
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

  const cancelEdit = () => {
    setEditMode(false);
    setEditedInventory(JSON.parse(JSON.stringify(inventory)));
    setSelectedItems([]);
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
    inventory,
    loading,
    error,
    editMode,
    editedInventory: editedInventory.length ? editedInventory : inventory,
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
