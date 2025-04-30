
import * as z from "zod";

export const formSchema = z.object({
  yourName: z.string().min(1, "Your name is required"),
  store: z.string().min(1, "Store is required"),
  dateReceived: z.string(),
  productNumber: z.string().min(1, "Product number is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  scheduleArrival: z.string().min(1, "Schedule arrival is required"),
  notes: z.string(),
  crossDock: z.string(),
  crossDockDestination: z.string().optional(),
  receiverNo: z.string().optional(),
  etaDate: z.string().optional(),
  crossDockConfirmation: z.boolean().optional().default(false),
  managersEmail: z.string(),
});

// Add custom validation for cross dock fields
export const validateCrossDockFields = (values: z.infer<typeof formSchema>) => {
  if (values.crossDock === "yes") {
    const errors: Record<string, string> = {};
    
    if (!values.crossDockDestination) {
      errors.crossDockDestination = "Destination store is required for cross dock orders";
    }
    
    if (!values.receiverNo) {
      errors.receiverNo = "Receiver No (MaddenCo) is required for cross dock orders";
    }
    
    if (!values.etaDate) {
      errors.etaDate = "ETA date is required for cross dock orders";
    }
    
    if (!values.crossDockConfirmation) {
      errors.crossDockConfirmation = "Please confirm paperwork is printed and attached";
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }
  
  return { isValid: true, errors: {} };
};

export type OrderFormValues = z.infer<typeof formSchema>;
