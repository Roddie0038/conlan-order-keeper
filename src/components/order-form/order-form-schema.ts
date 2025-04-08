
import { z } from "zod";

export const formSchema = z.object({
  yourName: z.string().min(2, { message: "Please enter your name" }),
  store: z.string().min(1, { message: "Please select a store" }),
  dateReceived: z.date({ required_error: "Please select a date" }),
  productNumber: z.string().min(1, { message: "Please enter the product number" }),
  description: z.string().min(1, { message: "Please enter the product description" }),
  quantity: z.string().min(1, { message: "Please enter the quantity" }),
  scheduleArrival: z.string().min(1, { message: "Please select an arrival day" }),
  notes: z.string().optional(),
  crossDock: z.string().min(1, { message: "Please select yes or no" }),
  crossDockDestination: z.string().optional(),
});

export type OrderFormValues = z.infer<typeof formSchema>;
