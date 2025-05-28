
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
  const { uploadDocument, uploading } = useDocumentUploader({ onFormSubmitted });
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
    },
  });

  const onSubmit = async (values: DocumentFormValues) => {
    // Ensure file exists before calling uploadDocument
    if (!values.file) {
      form.setError("file", { message: "Please select a file to upload" });
      return;
    }

    const success = await uploadDocument({
      file: values.file,
      title: values.title,
      description: values.description || "",
      type: values.type,
    });
    
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
        <FileField control={form.control} isSubmitting={uploading} />
        
        <Button 
          type="submit" 
          className="w-full md:w-auto" 
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </form>
    </Form>
  );
}
