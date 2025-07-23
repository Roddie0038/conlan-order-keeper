
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { stores, getStoreColor } from "@/components/order-form/formConfig";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
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
          storeName: storeObj.name, // This will now be "Fort Worth 022" for store 22
          storeId: storeId,
          userStore: user.store,  // Set the userStore field based on the authenticated user
          storeColors: storeColor  // Set the store colors automatically
        }));
      }

      const loadEmail = async () => {
        const email = await getFirstManagerEmail(user.store);
        setManagerEmail(email);
      };
      loadEmail();
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
        storeName: selectedStore.name, // This will now be "Fort Worth 022" for store 22
        userStore: user?.store || "",  // Preserve the user's actual store for validation
        storeColors: storeColor  // Set the store colors automatically
      }));
      
      const email = await getFirstManagerEmail(selectedStore.name);
      setManagerEmail(email);
    }
  };

  return { managerEmail, handleStoreChange, user };
}
