
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { MTOFormData, initialMTOFormData } from "../mto-form-config";

interface SessionValues {
  name: string;
}

export const useMTOForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionValues, setSessionValues] = useState<SessionValues>({
    name: "",
  });
  
  const [formData, setFormData] = useState<MTOFormData>(() => {
    return {
      ...initialMTOFormData,
      store: user?.store || "",
      managerEmail: "", // REMOVED - OT Platform handles email routing
    };
  });

  useEffect(() => {
    const storedName = sessionStorage.getItem('mtoOrderName');
    
    if (storedName) {
      setFormData(prev => ({
        ...prev,
        name: storedName || '',
      }));
      setSessionValues({
        name: storedName || '',
      });
    }
  }, []);

  // REMOVED: Email loading - OT Platform handles email routing
  useEffect(() => {
    if (user?.store) {
      setFormData(prev => ({
        ...prev,
        store: user.store,
      }));
    }
  }, [user?.store]);

  const handleChange = (field: string, value: string | string[]) => {
    if (field === 'store' && !user?.isAdmin) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'name') {
      sessionStorage.setItem('mtoOrderName', value as string);
      setSessionValues(prev => ({ ...prev, name: value as string }));
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialMTOFormData,
      store: user?.store || "",
      managerEmail: "", // REMOVED - OT Platform handles email routing
      name: sessionValues.name,
    });
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    setIsSubmitting,
    sessionValues,
    handleChange,
    resetForm,
    toast,
    isAdmin: user?.isAdmin || false
  };
};
