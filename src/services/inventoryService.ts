
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { 
  fetchInventory,
  updateInventoryQuantity,
  decreaseInventoryQuantity,
  increaseInventoryQuantity,
  createInventoryItem,
  deleteInventoryItem 
} from "./inventory/inventoryOperations";
import { 
  addInventoryItems,
  updateInventoryItem,
  deleteMultipleItems 
} from "./inventory/inventoryManagement";

// Re-export all functions to maintain backward compatibility
export {
  fetchInventory,
  updateInventoryQuantity,
  decreaseInventoryQuantity,
  increaseInventoryQuantity,
  createInventoryItem,
  deleteInventoryItem,
  addInventoryItems,
  updateInventoryItem,
  deleteMultipleItems
};
