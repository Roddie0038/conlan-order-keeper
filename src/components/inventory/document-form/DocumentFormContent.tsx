
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useDocumentUploader } from "@/hooks/useDocumentUploader";
import { documentFormSchema, DocumentFormValues } from "./schema";
import { TitleField } from "./TitleField";
import { DocumentTypeField } from "./DocumentTypeField";
import { DescriptionField } from "./DescriptionField";
import { FileField } from "./FileField";

interface DocumentFormContentProps {
  onFormSubmitted?: () => void;
}

export function DocumentFormContent({ onFormSubmitted }: DocumentFormContentProps) {
  const { uploadDocument, isSubmitting } = useDocumentUploader({ onFormSubmitted });
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
    },
  });

  const onSubmit = async (values: DocumentFormValues) => {
    const success = await uploadDocument(values);
    if (success) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TitleField control={form.control} />
          <DocumentTypeField control={form.control} />
        </div>
        
        <DescriptionField control={form.control} />
        <FileField control={form.control} isSubmitting={isSubmitting} />
        
        <Button 
          type="submit" 
          className="w-full md:w-auto" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Uploading..." : "Upload Document"}
        </Button>
      </form>
    </Form>
  );
}
