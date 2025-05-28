
import * as z from "zod";

export const documentFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  type: z.string().min(1, {
    message: "Please select a document type.",
  }),
  file: z.instanceof(File, {
    message: "Please select a file to upload.",
  }),
});

export type DocumentFormValues = z.infer<typeof documentFormSchema>;
