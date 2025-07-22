
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { WheelFormData } from "../types";
import { useWheelFormSubmission } from "./useWheelFormSubmission";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
import { normalizeStoreForSubmission } from "@/utils/storeNormalization";

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

  // Initialize form with user data
  useEffect(() => {
    if (user && !user.isAdmin) {
      setFormData(prev => ({
        ...prev,
        storeName: user.store || "",
        userStore: user.store || "",
        yourName: user.name || "",
      }));
    }
  }, [user]);

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const handleStoreChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, storeName: value, userStore: value }));
    
    if (errors.storeName) {
      setErrors(prev => ({ ...prev, storeName: "" }));
    }
  }, [errors.storeName]);

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
