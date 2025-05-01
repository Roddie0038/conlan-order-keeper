
import * as z from "zod";

// Base schema for shared fields
export const formSchema = z
  .object({
    yourName: z.string().min(1, "Your name is required"),
    store: z.string().min(1, "Store is required"),
    dateReceived: z.string(),
    productNumber: z.string().min(1, "Product number is required"),
    description: z.string().min(1, "Description is required"),
    quantity: z.string().min(1, "Quantity is required"),
    scheduleArrival: z.string().min(1, "Schedule arrival is required"),
    notes: z.string().optional(),
    crossDock: z.enum(["Yes", "No"], {
      required_error: "Please specify if this is a cross dock order",
    }),
    crossDockDestination: z.string().optional(),
    receiverNo: z.string().optional(),
    etaDate: z.string().optional(),
    crossDockConfirmation: z.boolean().optional().default(false),
    managersEmail: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.crossDock === "Yes") {
      if (!data.receiverNo || data.receiverNo.trim() === "") {
        ctx.addIssue({
          path: ["receiverNo"],
          code: z.ZodIssueCode.custom,
          message: "Receiver No is required when Cross Dock is Yes",
        });
      }

      if (!data.etaDate || data.etaDate.trim() === "") {
        ctx.addIssue({
          path: ["etaDate"],
          code: z.ZodIssueCode.custom,
          message: "ETA Date is required when Cross Dock is Yes",
        });
      }

      if (!data.crossDockConfirmation) {
        ctx.addIssue({
          path: ["crossDockConfirmation"],
          code: z.ZodIssueCode.custom,
          message: "Please confirm the Cross Dock paperwork is attached",
        });
      }
    }
  });

export type OrderFormValues = z.infer<typeof formSchema>;
