
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getFirstManagerEmail } from "@/utils/emailUtils";
import { MTOFormData } from "../mto-form-config";
import { logger } from '@/utils/logger';

export const useMTOForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<MTOFormData>({
    store: user?.store || "",
    name: "",
    timestamp: new Date().toLocaleString(),
    productNumber: "",
    casing_grade: [],
    tire_size: "",
    customTireSize: "",
    tireTreadNeeded: "",
    quantity: "",
    notes: "",
    managerEmail: "",
    destinationPlant: "", // ✅ Empty by default - user must select
  });

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      store: user?.store || "",
      name: "",
      timestamp: new Date().toLocaleString(),
      productNumber: "",
      casing_grade: [],
      tire_size: "",
      customTireSize: "",
      tireTreadNeeded: "",
      quantity: "",
      notes: "",
      managerEmail: "",
      destinationPlant: "",
    });
    setErrors({});
  };

  // Get manager email when needed
  const getManagerEmail = async () => {
    if (formData.store) {
      try {
        return await getFirstManagerEmail(formData.store);
      } catch (error) {
        logger.error("Error getting manager email", {
          service: 'useMTOForm',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        return "";
      }
    }
    return "";
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    errors,
    setErrors,
    handleChange,
    resetForm,
    getManagerEmail,
    toast,
    isAdmin: user?.isAdmin || false,
  };
};
