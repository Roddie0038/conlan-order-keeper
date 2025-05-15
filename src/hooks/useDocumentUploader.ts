
import { useState } from "react";
import { DocumentFormValues } from "@/components/inventory/document-form/schema";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/extended-client";
import { formatFileSize } from "@/utils/formatters";

interface UseDocumentUploaderProps {
  onFormSubmitted?: () => void;
}

export const useDocumentUploader = ({ onFormSubmitted }: UseDocumentUploaderProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const uploadDocument = async (values: DocumentFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Initialize variables to store file info
      let file_path = null;
      let file_name = null;
      let file_size = null;
      
      // Handle file upload if file exists
      if (values.file) {
        const file = values.file;
        file_name = file.name;
        file_size = formatFileSize(file.size);
        
        // Create a unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        file_path = fileName;
        
        console.log(`Uploading file: ${file_name}, size: ${file_size}, path: ${file_path}`);
        
        // Upload file to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('inventory-docs')
          .upload(file_path, file);
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }
      }
      
      // Save document metadata to the database
      const { error: dbError } = await supabase
        .from('inventory_documents')
        .insert({
          title: values.title,
          description: values.description || null,
          type: values.type,
          file_name,
          file_size,
          file_path,
          date: new Date().toISOString(),
        });
      
      if (dbError) {
        console.error('Error inserting document record:', dbError);
        throw dbError;
      }
      
      console.log('Document uploaded successfully');
      
      // Show success toast
      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded.",
      });
      
      // Call the callback function if provided
      if (onFormSubmitted) {
        console.log('Calling onFormSubmitted callback');
        onFormSubmitted();
      }
      
      return true;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your document. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    uploadDocument,
    isSubmitting
  };
};
