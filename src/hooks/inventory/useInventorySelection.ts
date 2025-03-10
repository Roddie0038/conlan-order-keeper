import { useState } from 'react';
import { InventoryItem } from '@/types/inventory';

export function useInventorySelection() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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

  return {
    selectedItems,
    setSelectedItems,
    handleSelectItem,
    handleSelectAll
  };
}
