
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUploader } from "../FileUploader";
import { Control } from "react-hook-form";
import { DocumentFormValues } from "./schema";

interface FileFieldProps {
  control: Control<DocumentFormValues>;
  isSubmitting: boolean;
}

export function FileField({ control, isSubmitting }: FileFieldProps) {
  return (
    <FormField
      control={control}
      name="file"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Upload File</FormLabel>
          <FormControl>
            <FileUploader
              value={field.value}
              onChange={field.onChange}
              disabled={isSubmitting}
            />
          </FormControl>
          <FormDescription>
            Upload Excel, CSV or other inventory related documents. Maximum file size: 5MB.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
