
import React, { createContext, useContext, ReactNode } from 'react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';

interface InventoryContextType {
  addInventoryItems: (items: InventoryItem[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { handleAddImportedItems } = useInventory();

  const value = {
    addInventoryItems: handleAddImportedItems
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryContext() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
}
