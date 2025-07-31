
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WheelFormData } from "../types";
import { useWheelFormSubmission } from "./useWheelFormSubmission";
import { getFirstManagerEmail } from "@/utils/emailUtils";
import { normalizeStoreForSubmission } from "@/utils/storeNormalization";
import { stores } from "@/components/order-form/formConfig";

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
      // Find the store object to get the correct storeId
      const userStoreObj = stores.find(store => store.name === user.store);
      const storeId = userStoreObj?.id || "";
      
      console.log("🔍 WHEEL FORM - User store mapping:", {
        userStore: user.store,
        foundStoreObj: userStoreObj,
        storeId: storeId
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
