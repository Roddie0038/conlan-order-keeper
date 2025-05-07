
import React, { createContext, useContext, useState, useEffect } from 'react';

interface InventoryItem {
  id: string;
  productNumber: string;
  description: string;
  quantity: number;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  loading: boolean;
  error: string | null;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock loading inventory data
  useEffect(() => {
    const loadInventory = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll simulate a delay and return mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockInventory: InventoryItem[] = [
          { id: '1', productNumber: 'T123', description: 'All Season Tire 225/65R17', quantity: 24 },
          { id: '2', productNumber: 'T456', description: 'Winter Tire 205/55R16', quantity: 12 },
          { id: '3', productNumber: 'T789', description: 'Performance Tire 245/40R18', quantity: 8 },
        ];
        
        setInventory(mockInventory);
        setLoading(false);
      } catch (err) {
        setError('Failed to load inventory data');
        setLoading(false);
      }
    };

    loadInventory();
  }, []);

  return (
    <InventoryContext.Provider value={{ inventory, setInventory, loading, error }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
