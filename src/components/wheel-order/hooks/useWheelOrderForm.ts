
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStatefulFormAutosave } from "@/hooks/useFormAutosave";
import { WheelFormData } from "../types";
import { useWheelFormSubmission } from "./useWheelFormSubmission";
import { getFirstManagerEmail } from "@/utils/emailUtils";
import { normalizeStoreForSubmission } from "@/utils/storeNormalization";
import { stores, getStoreColor } from "@/components/order-form/formConfig";
import { debugStoreNormalization } from "@/utils/normalization/StoreNormalizationUtils";
import "@/utils/debugWheelOrderIssue"; // Load debug utilities
import "@/utils/debugWheelPowderCoating"; // Load Wheel Powder Coating specific diagnostics

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
    storeColors: "", // ✅ Empty by default - auto-populates but can be overridden
    destinationPlant: "", // ✅ Empty by default - user must select
  });

  const [managerEmail, setManagerEmail] = useState("");

  // Auto-save functionality (only for non-admin users)
  const { lastSaved, isRestoring, clearPersistedData, saveNow } = useStatefulFormAutosave(
    formData,
    setFormData,
    'wheel-powder-coating',
    {
      enabled: !user?.isAdmin,
      excludeFields: ['userStore', 'storeColors'], // Exclude auto-generated fields
      onRestore: () => {
        console.log('🔄 Wheel powder coating form data restored');
      }
    }
  );

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
    console.log("🚨 WHEEL POWDER COATING FORM DEBUG - useEffect triggered", {
      user: user ? { 
        store: user.store, 
        name: user.name, 
        isAdmin: user.isAdmin 
      } : null,
      currentFormData: {
        storeName: formData.storeName,
        storeId: formData.storeId,
        userStore: formData.userStore
      }
    });

    if (user && !user.isAdmin) {
      // Debug store normalization
      if (user.store) {
        debugStoreNormalization(user.store, 'wheel-powder-coating-form-init');
      }
      
      console.log("🔍 WHEEL POWDER COATING DEBUG - User initialization:", {
        userStore: user.store,
        allStores: stores.map(s => ({ id: s.id, name: s.name }))
      });

      // Method 1: Try exact name match first
      let userStoreObj = stores.find(store => store.name === user.store);
      console.log("🔍 WHEEL POWDER COATING DEBUG - Exact name match attempt:", {
        userStore: user.store,
        found: userStoreObj
      });
      
      // Method 2: If no exact match, try to extract store number and match by ID
      if (!userStoreObj && user.store) {
        const storeNumberMatch = user.store.match(/(\d+)$/);
        if (storeNumberMatch) {
          const extractedNumber = storeNumberMatch[1].replace(/^0+/, ''); // Remove leading zeros
          userStoreObj = stores.find(store => store.id === extractedNumber);
          console.log("🔍 WHEEL POWDER COATING DEBUG - Store number extraction:", {
            originalStore: user.store,
            storeNumberMatch,
            extractedNumber,
            foundByNumber: userStoreObj
          });
        }
      }
      
      // 🚨 CRITICAL FIX: Handle fallback if still no store found
      if (!userStoreObj) {
        console.error("🚨 WHEEL POWDER COATING CRITICAL - No store match found! This should not happen.", {
          userStore: user.store,
          allStores: stores,
          formWillNotInitialize: true
        });
        // Only proceed if we have a valid store match
        return;
      }
      
      const storeId = userStoreObj.id;
      
      console.log("🔍 WHEEL POWDER COATING DEBUG - Final store mapping:", {
        userStore: user.store,
        foundStoreObj: userStoreObj,
        storeId: storeId,
        storeName: userStoreObj.name
      });

      const newFormData = {
        ...formData,
        storeName: "", // ✅ Empty by default - user must select
        storeId: "", // ✅ Empty by default - user must select  
        userStore: user.store || "",
        yourName: user.name || "",
        storeColors: "", // ✅ Empty by default - will auto-populate when store selected
      };

      console.log("🔍 WHEEL POWDER COATING DEBUG - Setting form data:", {
        before: formData,
        after: newFormData
      });

      setFormData(newFormData);
    } else if (user && user.isAdmin) {
      console.log("🔍 WHEEL POWDER COATING DEBUG - Admin user, skipping auto store setup:", {
        adminUser: user.name,
        currentFormData: formData
      });
    }
  }, [user]);

  const handleInputChange = useCallback((name: string, value: string) => {
    console.log(`🔄 WHEEL FORM - Field change: ${name} = ${value}`);
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Trigger immediate save for critical fields
    if (['customerName', 'wheelType', 'wheelSize', 'destinationPlant'].includes(name)) {
      setTimeout(saveNow, 100); // Debounced manual save
    }
  }, [errors, saveNow]);

  const handleStoreChange = useCallback((value: string) => {
    const selectedStore = stores.find(store => store.id === value);
    console.log("🔄 WHEEL FORM - Store change:", {
      selectedValue: value,
      selectedStore: selectedStore
    });

    if (selectedStore) {
      const autoStoreColor = getStoreColor(selectedStore.name);
      setFormData(prev => ({ 
        ...prev, 
        storeName: selectedStore.name, // This will now be "Fort Worth 022" for store 22
        storeId: value, // ✅ Set storeId from selection
        userStore: user?.store || "",
        storeColors: prev.storeColors || autoStoreColor // ✅ Auto-populate if not manually set
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
    // Auto-save related
    lastSaved,
    isRestoring,
    clearPersistedData,
    saveNow
  };
}
