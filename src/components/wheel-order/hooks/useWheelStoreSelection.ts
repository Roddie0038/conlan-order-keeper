
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useOTStores, useOTStoreColors } from "@/integrations/ot-platform/hooks/useOTStores";
import { WheelFormData } from "../types";

export function useWheelStoreSelection(formData: WheelFormData, setFormData: React.Dispatch<React.SetStateAction<WheelFormData>>) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: stores = [] } = useOTStores();
  const { data: storeColorsMap } = useOTStoreColors();
  
  // REMOVED: Manager email - OT Platform handles email routing
  
  useEffect(() => {
    if (user?.store && stores.length > 0) {
      const storeIdMatch = user.store.match(/\d+$/);
      const storeId = storeIdMatch ? storeIdMatch[0].padStart(3, '0') : "";
      
      const storeObj = stores.find(s => s.store_number === storeId);
      
      if (storeObj) {
        // Get color from OT Platform
        const storeColorData = storeColorsMap?.get(storeId);
        const storeColor = storeColorData?.color_name || "";
        
        setFormData(prev => ({
          ...prev,
          storeName: user.store,
          storeId: storeId,
          userStore: user.store,
          storeColors: storeColor
        }));
      }
    }
  }, [user?.store, stores, storeColorsMap, setFormData]);

  const handleStoreChange = async (value: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You can only submit orders for your own store.",
        variant: "destructive",
      });
      return;
    }

    const selectedStore = stores.find(store => store.store_number === value);
    if (selectedStore) {
      // Get color from OT Platform
      const storeColorData = storeColorsMap?.get(value);
      const storeColor = storeColorData?.color_name || "";
      
      setFormData(prev => ({ 
        ...prev, 
        storeId: value,
        storeName: selectedStore.store_name,
        userStore: user?.store || "",
        storeColors: storeColor
      }));
    }
  };

  return { managerEmail: "", handleStoreChange, user }; // Return empty string for managerEmail
}
