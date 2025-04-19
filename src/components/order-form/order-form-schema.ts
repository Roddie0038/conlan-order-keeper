
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
  managersEmail: z.string(),
  // New Cross Dock Details fields
  transferWorkOrderNumber: z.string().optional(),
  trailerNumber: z.string().optional(),
  eta: z.string().optional(),
  crossDockFile: z.string().optional(),
  crossDockConfirmation: z.boolean().optional()
}).refine((data) => {
  // If crossDock is "yes", require the transferWorkOrderNumber, eta, and crossDockConfirmation
  if (data.crossDock === "yes") {
    return !!data.transferWorkOrderNumber && !!data.eta && !!data.crossDockConfirmation;
  }
  return true;
}, {
  message: "Required cross dock fields are missing",
  path: ["crossDockConfirmation"]
});

export type OrderFormValues = z.infer<typeof formSchema>;
