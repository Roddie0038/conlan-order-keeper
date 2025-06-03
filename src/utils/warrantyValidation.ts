
import { RetreadWarrantyFormData } from "@/hooks/useRetreadWarrantyForm";

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
