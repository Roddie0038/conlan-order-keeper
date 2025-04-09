
import * as z from "zod";

export const formSchema = z.object({
  yourName: z.string().min(2, "Name is required"),
  store: z.string().min(1, "Store is required"),
  dateReceived: z.date({
    required_error: "Date received is required",
  }),
  productNumber: z.string().min(1, "Product number is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.string().min(1, "Quantity is required"),
  scheduleArrival: z.string().min(1, "Schedule arrival is required"),
  notes: z.string().optional(),
  crossDock: z.string().min(1, "Cross dock option is required"),
  crossDockDestination: z.string().optional(),
  managersEmail: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof formSchema>;
