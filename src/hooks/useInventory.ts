import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface InventoryItem {
  id: string;
  productNumber: string;
  description: string;
  quantity: number;
  minThreshold: number;
  lastUpdated: string;
  lowStock: boolean;
}

export type SortField = 'productNumber' | 'description' | 'quantity' | 'minThreshold' | 'lastUpdated';
export type SortDirection = 'asc' | 'desc';

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editedInventory, setEditedInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();

  useEffect(() => {
    // Load inventory from localStorage
    const savedInventory = localStorage.getItem('inventory');
    let loadedInventory: InventoryItem[] = [];
    
    if (savedInventory) {
      loadedInventory = JSON.parse(savedInventory);
    } else {
      // Sample data if no inventory exists
      loadedInventory = [
        {
          id: "1",
          productNumber: "PT-1234",
          description: "Premium Tire Size 225/65R17",
          quantity: 15,
          minThreshold: 5,
          lastUpdated: new Date().toISOString(),
          lowStock: false
        },
        {
          id: "2",
          productNumber: "RIM-789",
          description: "Alloy Rim 17-inch Black",
          quantity: 3,
          minThreshold: 3,
          lastUpdated: new Date().toISOString(),
          lowStock: true
        },
        {
          id: "3",
          productNumber: "VT-456",
          description: "Valve Stem Kit",
          quantity: 50,
          minThreshold: 10,
          lastUpdated: new Date().toISOString(),
          lowStock: false
        }
      ];
      localStorage.setItem('inventory', JSON.stringify(loadedInventory));
    }
    
    setInventory(loadedInventory);
    setEditedInventory(JSON.parse(JSON.stringify(loadedInventory)));
  }, []);

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
      productNumber: "",
      description: "",
      quantity: 0,
      minThreshold: 5,
      lastUpdated: new Date().toISOString(),
      lowStock: false
    };
    
    setInventory([...inventory, newItem]);
    setEditedInventory([...editedInventory, newItem]);
    setEditMode(true);
  };

  const handleSaveChanges = () => {
    // Update the inventory with edited values
    setInventory(editedInventory);
    
    // Save to localStorage
    localStorage.setItem('inventory', JSON.stringify(editedInventory));
    
    // Calculate which items are now low stock
    const itemsNowLowStock = editedInventory.filter(item => 
      item.quantity <= item.minThreshold
    );
    
    toast({
      title: "Inventory Updated",
      description: `${editedInventory.length} items updated. ${itemsNowLowStock.length} items are below threshold.`
    });
    
    setEditMode(false);
  };

  const handleEdit = (id: string, field: keyof InventoryItem, value: string | number | boolean) => {
    setEditedInventory(prev => 
      prev.map(item => {
        if (item.id !== id) return item;
        
        // Create updated item with the new field value
        const updatedItem = { 
          ...item, 
          [field]: value,
          lastUpdated: new Date().toISOString()
        };
        
        // Determine if item is low stock based on updated values
        let isLowStock = item.lowStock;
        
        // Only recalculate low stock status if quantity or min threshold changed
        if (field === 'quantity' || field === 'minThreshold') {
          const currentQuantity = field === 'quantity' ? Number(value) : item.quantity;
          const currentThreshold = field === 'minThreshold' ? Number(value) : item.minThreshold;
          isLowStock = currentQuantity <= currentThreshold;
        } else if (field === 'lowStock') {
          // If directly setting lowStock, use the provided boolean value
          isLowStock = Boolean(value);
        }
        
        return {
          ...updatedItem,
          lowStock: isLowStock
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
      const updatedInventory = inventory.filter(item => item.id !== id);
      setInventory(updatedInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
      
      toast({
        title: "Item Deleted",
        description: "Inventory item has been removed."
      });
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
      const updatedInventory = inventory.filter(item => !selectedItems.includes(item.id));
      setInventory(updatedInventory);
      localStorage.setItem('inventory', JSON.stringify(updatedInventory));
      
      toast({
        title: "Items Deleted",
        description: `${selectedItems.length} inventory items have been removed.`
      });
    }
    // Clear selection after delete
    setSelectedItems([]);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditedInventory(JSON.parse(JSON.stringify(inventory)));
    setSelectedItems([]);
  };

  return {
    inventory,
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
    cancelEdit
  };
}
