
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { MTOFormData, initialMTOFormData } from "../mto-form-config";

interface SessionValues {
  name: string;
  scheduleArrival: string;
}

export const useMTOForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionValues, setSessionValues] = useState<SessionValues>({
    name: "",
    scheduleArrival: "",
  });
  
  const [formData, setFormData] = useState<MTOFormData>({
    ...initialMTOFormData,
    store: user?.store || "",
  });

  useEffect(() => {
    const storedName = sessionStorage.getItem('mtoOrderName');
    const storedSchedule = sessionStorage.getItem('mtoOrderSchedule');
    
    if (storedName || storedSchedule) {
      setFormData(prev => ({
        ...prev,
        name: storedName || '',
        scheduleArrival: storedSchedule || '',
      }));
      setSessionValues({
        name: storedName || '',
        scheduleArrival: storedSchedule || '',
      });
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'name') {
      sessionStorage.setItem('mtoOrderName', value);
      setSessionValues(prev => ({ ...prev, name: value }));
    }
    if (field === 'scheduleArrival') {
      sessionStorage.setItem('mtoOrderSchedule', value);
      setSessionValues(prev => ({ ...prev, scheduleArrival: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      ...initialMTOFormData,
      store: user?.store || "",
      name: sessionValues.name,
      scheduleArrival: sessionValues.scheduleArrival,
    });
  };

  return {
    formData,
    isSubmitting,
    setIsSubmitting,
    sessionValues,
    handleChange,
    resetForm,
    toast
  };
};
