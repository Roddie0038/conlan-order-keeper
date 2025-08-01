
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStatefulFormAutosave } from "./useFormAutosave";

export interface RetreadWarrantyFormData {
  dotNumber: string;
  condition: string;
  notes: string;
  customerName: string;
  workOrder: string;
  tireSize: string;
  invoiceFile: File | null;
  photoFiles: File[];
  acknowledged: boolean;
  destinationPlant: string;
}

export const useRetreadWarrantyForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<RetreadWarrantyFormData>({
    dotNumber: "",
    condition: "",
    notes: "",
    customerName: "",
    workOrder: "",
    tireSize: "",
    invoiceFile: null,
    photoFiles: [],
    acknowledged: false,
    destinationPlant: ""
  });

  // Auto-save functionality (only for non-admin users)
  const { lastSaved, isRestoring, clearPersistedData, saveNow } = useStatefulFormAutosave(
    form,
    setForm,
    'warranty',
    {
      enabled: !user?.isAdmin,
      excludeFields: ['invoiceFile', 'photoFiles'], // Exclude file objects from persistence
      onRestore: () => {
        console.log('🔄 Warranty form data restored');
      }
    }
  );

  const handleChange = (field: keyof RetreadWarrantyFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Trigger immediate save for critical fields
    if (['dotNumber', 'condition', 'customerName', 'destinationPlant'].includes(field)) {
      setTimeout(saveNow, 100); // Debounced manual save
    }
  };

  const handleFileChange = (field: 'invoiceFile' | 'photoFiles', files: File | File[] | null) => {
    if (field === 'invoiceFile') {
      setForm(prev => ({ ...prev, [field]: files as File | null }));
    } else {
      setForm(prev => ({ ...prev, [field]: files as File[] }));
    }
  };

  const handleCheckbox = (checked: boolean) => {
    setForm(prev => ({ ...prev, acknowledged: checked }));
    if (errors.acknowledged) {
      setErrors(prev => ({ ...prev, acknowledged: "" }));
    }
  };

  const resetForm = () => {
    clearPersistedData();
    setForm({
      dotNumber: "",
      condition: "",
      notes: "",
      customerName: "",
      workOrder: "",
      tireSize: "",
      invoiceFile: null,
      photoFiles: [],
      acknowledged: false,
      destinationPlant: ""
    });
    setErrors({});
  };

  return {
    form,
    loading,
    setLoading,
    errors,
    setErrors,
    handleChange,
    handleFileChange,
    handleCheckbox,
    resetForm,
    // Auto-save related
    lastSaved,
    isRestoring,
    clearPersistedData,
    saveNow
  };
};
