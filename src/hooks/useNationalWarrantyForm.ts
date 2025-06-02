
import { useState } from "react";

export interface NationalWarrantyFormData {
  // Auto-filled fields
  storeLocation: string;
  managerName: string;
  
  // Required fields
  customerName: string;
  workOrder: string;
  vehicleMake: string;
  vinOrUnit: string;
  modelYear: string;
  purchaseDate: string;
  wheelPosition: string;
  dotNumber: string;
  tireSize: string;
  loadRange: string;
  wearPercentage: string;
  mileageOnTire: string;
  reasonForAdjustment: string;
  exciseTaxCollected: boolean;
  signatureFile: File | null;
  acknowledged: boolean;
  
  // Optional fields
  replacementProductCode: string;
  photoFiles: File[];
  notes: string;
}

export const useNationalWarrantyForm = () => {
  const [form, setForm] = useState<NationalWarrantyFormData>({
    storeLocation: "",
    managerName: "",
    customerName: "",
    workOrder: "",
    vehicleMake: "",
    vinOrUnit: "",
    modelYear: "",
    purchaseDate: "",
    wheelPosition: "",
    dotNumber: "",
    tireSize: "",
    loadRange: "",
    wearPercentage: "",
    mileageOnTire: "",
    reasonForAdjustment: "",
    exciseTaxCollected: false,
    signatureFile: null,
    acknowledged: false,
    replacementProductCode: "",
    photoFiles: [],
    notes: "",
  });

  const updateForm = (field: keyof NationalWarrantyFormData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      storeLocation: "",
      managerName: "",
      customerName: "",
      workOrder: "",
      vehicleMake: "",
      vinOrUnit: "",
      modelYear: "",
      purchaseDate: "",
      wheelPosition: "",
      dotNumber: "",
      tireSize: "",
      loadRange: "",
      wearPercentage: "",
      mileageOnTire: "",
      reasonForAdjustment: "",
      exciseTaxCollected: false,
      signatureFile: null,
      acknowledged: false,
      replacementProductCode: "",
      photoFiles: [],
      notes: "",
    });
  };

  return {
    form,
    updateForm,
    resetForm,
  };
};
