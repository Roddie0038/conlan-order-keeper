
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { stores, getManagerEmail } from "@/components/order-form/formConfig";
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
        setFormData(prev => ({
          ...prev,
          storeName: user.store,
          storeId: storeId
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
      setFormData(prev => ({ 
        ...prev, 
        storeId: value,
        storeName: selectedStore.name
      }));
      
      const email = getManagerEmail(selectedStore.name);
      setManagerEmail(email);
    }
  };

  return { managerEmail, handleStoreChange, user };
}
