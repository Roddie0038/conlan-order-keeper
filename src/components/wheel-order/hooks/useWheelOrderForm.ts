
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WheelFormData } from "../types";
import { useWheelFormSubmission } from "./useWheelFormSubmission";
import { getFirstManagerEmail } from "@/utils/emailUtils";
import { normalizeStoreForSubmission } from "@/utils/storeNormalization";
import { stores } from "@/components/order-form/formConfig";
import { debugStoreNormalization } from "@/utils/normalization/StoreNormalizationUtils";

export function useWheelOrderForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<WheelFormData>({
    yourName: "",
    storeName: "",
    storeId: "",
    dateReceived: new Date().toISOString().split("T")[0],
    qtyWheels: "",
    customerName: "",
    wheelMaterial: "",
    wheelType: "",
    handHoles: "",
    wheelSize: "",
    wheelColor: "",
    scheduleArrival: "",
    userStore: "",
    storeColors: "",
    destinationPlant: "", // ✅ Empty by default - user must select
  });

  const [managerEmail, setManagerEmail] = useState("");

  // Get manager email when store changes
  useEffect(() => {
    const getManagerEmail = async () => {
      if (formData.storeName) {
        try {
          const normalizedStore = normalizeStoreForSubmission(formData.storeName);
          const email = await getFirstManagerEmail(normalizedStore);
          setManagerEmail(email);
        } catch (error) {
          console.error("Error getting manager email:", error);
          setManagerEmail("");
        }
      }
    };

    getManagerEmail();
  }, [formData.storeName]);

  // Initialize form with user data and fix storeId mapping
  useEffect(() => {
    if (user && !user.isAdmin) {
      // Debug store normalization
      if (user.store) {
        debugStoreNormalization(user.store, 'wheel-form-init');
      }
      
      console.log("🔍 WHEEL FORM DEBUG - User initialization:", {
        userStore: user.store,
        allStores: stores.map(s => ({ id: s.id, name: s.name }))
      });

      // Method 1: Try exact name match first
      let userStoreObj = stores.find(store => store.name === user.store);
      
      // Method 2: If no exact match, try to extract store number and match by ID
      if (!userStoreObj && user.store) {
        const storeNumberMatch = user.store.match(/(\d+)$/);
        if (storeNumberMatch) {
          const extractedNumber = storeNumberMatch[1].replace(/^0+/, ''); // Remove leading zeros
          userStoreObj = stores.find(store => store.id === extractedNumber);
          console.log("🔍 WHEEL FORM DEBUG - Store number extraction:", {
            originalStore: user.store,
            extractedNumber,
            foundByNumber: userStoreObj
          });
        }
      }
      
      const storeId = userStoreObj?.id || "";
      
      console.log("🔍 WHEEL FORM DEBUG - Final store mapping:", {
        userStore: user.store,
        foundStoreObj: userStoreObj,
        storeId: storeId,
        storeName: userStoreObj?.name
      });

      setFormData(prev => ({
        ...prev,
        storeName: userStoreObj?.name || user.store || "", // Use the display name from stores config
        storeId: storeId, // ✅ Fixed storeId mapping
        userStore: user.store || "",
        yourName: user.name || "",
      }));

      // Warn if storeId is missing
      if (!storeId) {
        console.warn("🚨 WHEEL FORM - storeId is missing for user store:", user.store);
        console.warn("🚨 WHEEL FORM - Available stores:", stores);
      }
    }
  }, [user]);

  const handleInputChange = useCallback((name: string, value: string) => {
    console.log(`🔄 WHEEL FORM - Field change: ${name} = ${value}`);
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const handleStoreChange = useCallback((value: string) => {
    const selectedStore = stores.find(store => store.id === value);
    console.log("🔄 WHEEL FORM - Store change:", {
      selectedValue: value,
      selectedStore: selectedStore
    });

    if (selectedStore) {
      setFormData(prev => ({ 
        ...prev, 
        storeName: selectedStore.name, // This will now be "Fort Worth 022" for store 22
        storeId: value, // ✅ Set storeId from selection
        userStore: user?.store || ""
      }));
    }
    
    if (errors.storeName) {
      setErrors(prev => ({ ...prev, storeName: "" }));
    }
  }, [errors.storeName, user?.store]);

  const { isSubmitting, handleSubmit } = useWheelFormSubmission(formData, managerEmail, errors, setErrors);

  return {
    formData,
    setFormData,
    managerEmail,
    isSubmitting,
    user,
    errors,
    setErrors,
    handleInputChange,
    handleStoreChange,
    handleSubmit,
  };
}
