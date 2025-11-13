
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { stores, getStoreColor } from "@/components/order-form/formConfig";
import { WheelFormData } from "../types";

export function useWheelStoreSelection(formData: WheelFormData, setFormData: React.Dispatch<React.SetStateAction<WheelFormData>>) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // REMOVED: Manager email - OT Platform handles email routing
  
  useEffect(() => {
    if (user?.store) {
      const storeIdMatch = user.store.match(/\d+$/);
      const storeId = storeIdMatch ? storeIdMatch[0].padStart(3, '0') : "";
      
      const storeObj = stores.find(s => s.id === storeId);
      
      if (storeObj) {
        const storeColor = getStoreColor(user.store);
        setFormData(prev => ({
          ...prev,
          storeName: user.store,
          storeId: storeId,
          userStore: user.store,
          storeColors: storeColor
        }));
      }
    }
  }, [user?.store, setFormData]);

  const handleStoreChange = async (value: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You can only submit orders for your own store.",
        variant: "destructive",
      });
      return;
    }

    const selectedStore = stores.find(store => store.id === value);
    if (selectedStore) {
      const storeColor = getStoreColor(selectedStore.name);
      setFormData(prev => ({ 
        ...prev, 
        storeId: value,
        storeName: selectedStore.name,
        userStore: user?.store || "",
        storeColors: storeColor
      }));
    }
  };

  return { managerEmail: "", handleStoreChange, user }; // Return empty string for managerEmail
}
