
export interface InventoryItem {
  id: string;
  product_number: string;
  description: string;
  quantity: number;
  min_threshold: number;
  last_updated: string;
  low_stock: boolean;
}

// Define a type for the database item as it comes from Supabase
export interface DatabaseInventoryItem {
  id?: string;
  product_number: string;
  description: string;
  quantity: number;
  min_threshold?: number;
  last_updated?: string;
  low_stock?: boolean;
}

// Define a type for update data to avoid recursion
export interface InventoryItemUpdateData {
  product_number?: string;
  description?: string;
  quantity?: number;
  min_threshold?: number;
  low_stock?: boolean;
}

export interface InventoryContextType {
  inventory: InventoryItem[];
  loading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
  addInventoryItems: (items: Omit<InventoryItem, 'id' | 'last_updated' | 'low_stock'>[]) => Promise<void>;
  updateInventoryItem: (id: string, data: InventoryItemUpdateData) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;
  deleteMultipleItems: (ids: string[]) => Promise<void>;
}
