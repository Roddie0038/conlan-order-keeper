
import { RetreadWarrantyFormData } from "@/hooks/useRetreadWarrantyForm";
import { NationalWarrantyFormData } from "@/hooks/useNationalWarrantyForm";

export const validateWarrantyForm = (form: RetreadWarrantyFormData) => {
  const errors: string[] = [];

  if (!form.acknowledged) {
    errors.push("Please acknowledge credit terms before submitting.");
  }
  
  if (!form.customerName) {
    errors.push("Customer name is required.");
  }
  
  if (!form.workOrder) {
    errors.push("Work order number is required.");
  }
  
  if (!form.dotNumber) {
    errors.push("DOT number is required.");
  }
  
  if (!form.condition) {
    errors.push("Tire condition is required.");
  }
  
  if (!form.invoiceFile) {
    errors.push("Invoice file is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateNationalWarrantyForm = (form: NationalWarrantyFormData) => {
  const errors: string[] = [];

  if (!form.acknowledged) {
    errors.push("Please acknowledge that you will not dispose of the tire until authorized.");
  }
  
  if (!form.customerName) {
    errors.push("Customer name is required.");
  }
  
  if (!form.workOrder) {
    errors.push("Work order number is required.");
  }
  
  if (!form.vehicleMake) {
    errors.push("Vehicle make is required.");
  }
  
  if (!form.vinOrUnit) {
    errors.push("VIN or Unit number is required.");
  }
  
  if (!form.modelYear) {
    errors.push("Model year is required.");
  }
  
  if (!form.purchaseDate) {
    errors.push("Purchase date is required.");
  }
  
  if (!form.wheelPosition) {
    errors.push("Wheel position is required.");
  }
  
  if (!form.dotNumber) {
    errors.push("DOT number is required.");
  }
  
  if (!form.tireSize) {
    errors.push("Tire size is required.");
  }
  
  if (!form.loadRange) {
    errors.push("Load range is required.");
  }
  
  if (!form.wearPercentage) {
    errors.push("Wear percentage or tread depth is required.");
  }
  
  if (!form.mileageOnTire) {
    errors.push("Mileage on tire is required.");
  }
  
  if (!form.reasonForAdjustment) {
    errors.push("Reason for adjustment is required.");
  }
  
  if (!form.signatureFile) {
    errors.push("Customer signature is required.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
