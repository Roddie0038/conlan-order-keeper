
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { DocumentFormValues } from "./schema";

interface DescriptionFieldProps {
  control: Control<DocumentFormValues>;
}

export function DescriptionField({ control }: DescriptionFieldProps) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description (Optional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter a brief description of the document" 
              {...field} 
              value={field.value || ''}
            />
          </FormControl>
          <FormDescription>
            Provide any additional details about this document.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
