
import { useState } from 'react';
import { InventoryItem } from '@/types/inventory';

export type SortField = 'product_number' | 'description' | 'quantity' | 'min_threshold' | 'last_updated';
export type SortDirection = 'asc' | 'desc';

export function useSortInventory() {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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

  return {
    sortField,
    sortDirection,
    handleSort,
    getSortedData
  };
}
