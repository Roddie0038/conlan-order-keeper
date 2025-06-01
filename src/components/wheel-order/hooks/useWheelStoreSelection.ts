
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { stores, getManagerEmail, getStoreColor } from "@/components/order-form/formConfig";
import { WheelFormData } from "../types";

export function useWheelStoreSelection(formData: WheelFormData, setFormData: React.Dispatch<React.SetStateAction<WheelFormData>>) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [managerEmail, setManagerEmail] = useState("");
  
  useEffect(() => {
    if (user?.store) {
      const storeIdMatch = user.store.match(/\d+$/);
      const storeId = storeIdMatch ? storeIdMatch[0] : "";
      
      const storeObj = stores.find(s => s.id === storeId);
      
      if (storeObj) {
        const storeColor = getStoreColor(user.store);
        setFormData(prev => ({
          ...prev,
          storeName: user.store,
          storeId: storeId,
          userStore: user.store,  // Set the userStore field based on the authenticated user
          storeColors: storeColor  // Set the store colors automatically
        }));
      }

      const email = getManagerEmail(user.store);
      setManagerEmail(email);
    }
  }, [user?.store, setFormData]);

  const handleStoreChange = (value: string) => {
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
        userStore: user?.store || "",  // Preserve the user's actual store for validation
        storeColors: storeColor  // Set the store colors automatically
      }));
      
      const email = getManagerEmail(selectedStore.name);
      setManagerEmail(email);
    }
  };

  return { managerEmail, handleStoreChange, user };
}
