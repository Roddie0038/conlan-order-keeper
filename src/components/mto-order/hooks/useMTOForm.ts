
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { MTOFormData, initialMTOFormData } from "../mto-form-config";
import { storeManagerEmails } from "@/components/order-form/formConfig";

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

  const getManagerEmail = (store: string) => {
    if (store === "Admin") return storeManagerEmails["Admin"];
    const match = store.match(/\d+$/);
    const storeNumber = match ? match[0] : '';
    return storeManagerEmails[storeNumber] || '';
  };
  
  const [formData, setFormData] = useState<MTOFormData>(() => {
    // Initialize with user's store and corresponding manager email
    return {
      ...initialMTOFormData,
      store: user?.store || "",
      managerEmail: user?.store ? getManagerEmail(user.store) : "",
    };
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

  useEffect(() => {
    if (user?.store) {
      const managerEmail = getManagerEmail(user.store);
      setFormData(prev => ({
        ...prev,
        store: user.store,
        managerEmail: managerEmail
      }));
    }
  }, [user?.store]);

  const handleChange = (field: string, value: string) => {
    // Don't allow changing the store field unless user is admin
    if (field === 'store' && !user?.isAdmin) {
      return;
    }

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
      managerEmail: user?.store ? getManagerEmail(user.store) : "",
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
    toast,
    isAdmin: user?.isAdmin || false
  };
};
