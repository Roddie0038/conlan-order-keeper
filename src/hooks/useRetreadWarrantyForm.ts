
import { useState } from "react";

export interface RetreadWarrantyFormData {
  customerName: string;
  workOrder: string;
  dotNumber: string;
  tireSize: string;
  condition: string;
  notes: string;
  invoiceFile: File | null;
  photoFiles: File[];
  acknowledged: boolean;
}

export const useRetreadWarrantyForm = () => {
  const [form, setForm] = useState<RetreadWarrantyFormData>({
    customerName: "",
    workOrder: "",
    dotNumber: "",
    tireSize: "",
    condition: "",
    notes: "",
    invoiceFile: null,
    photoFiles: [],
    acknowledged: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "invoice" | "photos") => {
    if (type === "invoice") {
      setForm({ ...form, invoiceFile: e.target.files?.[0] || null });
    } else {
      setForm({ ...form, photoFiles: Array.from(e.target.files || []) });
    }
  };

  const handleCheckbox = (checked: boolean) => {
    setForm({ ...form, acknowledged: checked });
  };

  const resetForm = () => {
    setForm({
      customerName: "",
      workOrder: "",
      dotNumber: "",
      tireSize: "",
      condition: "",
      notes: "",
      invoiceFile: null,
      photoFiles: [],
      acknowledged: false,
    });
    
    // Reset file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => input.value = '');
  };

  return {
    form,
    loading,
    setLoading,
    handleChange,
    handleFileChange,
    handleCheckbox,
    resetForm,
  };
};
