
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { stores, getStoreColor } from "@/components/order-form/formConfig";
import { getFirstManagerEmail } from "@/utils/emailUtils";
import { WheelFormData } from "../types";

export function useWheelStoreSelection(formData: WheelFormData, setFormData: React.Dispatch<React.SetStateAction<WheelFormData>>) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [managerEmail, setManagerEmail] = useState("");
  
  useEffect(() => {
    if (user?.store) {
      console.log("🔍 WHEEL STORE SELECTION DEBUG - User store:", user.store);
      
      // Method 1: Try exact name match first
      let storeObj = stores.find(s => s.name === user.store);
      
      // Method 2: If no exact match, extract store number and match by ID
      if (!storeObj) {
        const storeIdMatch = user.store.match(/(\d+)$/);
        if (storeIdMatch) {
          const extractedNumber = storeIdMatch[1].replace(/^0+/, ''); // Remove leading zeros
          storeObj = stores.find(s => s.id === extractedNumber);
          console.log("🔍 WHEEL STORE SELECTION DEBUG - Store number extraction:", {
            originalStore: user.store,
            extractedNumber,
            foundStoreObj: storeObj
          });
        }
      }
      
      // 🚨 CRITICAL FIX: Validate store found before proceeding
      if (!storeObj) {
        console.error("🚨 WHEEL STORE SELECTION CRITICAL - No store match found for user:", user.store);
        console.error("🚨 Available stores:", stores.map(s => ({ id: s.id, name: s.name })));
        // Don't set any store data if we can't find a match
        return;
      }
      
      const storeId = storeObj.id;
      
      console.log("🔍 WHEEL STORE SELECTION DEBUG - Final mapping:", {
        userStore: user.store,
        foundStoreObj: storeObj,
        storeId: storeId
      });
      
      const storeColor = getStoreColor(user.store);
      setFormData(prev => ({
        ...prev,
        storeName: storeObj.name, // Use the display name from stores config
        storeId: storeId, // ✅ Fixed storeId mapping
        userStore: user.store,  // Set the userStore field based on the authenticated user
        storeColors: storeColor  // Set the store colors automatically
      }));

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
