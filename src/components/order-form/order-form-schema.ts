
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
});

export type OrderFormValues = z.infer<typeof formSchema>;
