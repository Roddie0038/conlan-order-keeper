
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod"; // Fixed import statement
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUploader } from "./FileUploader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  type: z.string().min(1, {
    message: "Please select a document type.",
  }),
  file: z.instanceof(File).optional(),
});

type DocumentFormValues = z.infer<typeof formSchema>;

interface DocumentFormProps {
  onFormSubmitted?: () => void;
}

export function DocumentForm({ onFormSubmitted }: DocumentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
    },
  });

  const onSubmit = async (values: DocumentFormValues) => {
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
      
      // Reset form
      form.reset();
      
      // Call the callback function if provided
      if (onFormSubmitted) {
        console.log('Calling onFormSubmitted callback');
        onFormSubmitted();
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "There was a problem uploading your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Upload Document</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter document title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inventory">Inventory Sheet</SelectItem>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="purchase_order">Purchase Order</SelectItem>
                      <SelectItem value="packing_slip">Packing Slip</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
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
          
          <FormField
            control={form.control}
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
          
          <Button 
            type="submit" 
            className="w-full md:w-auto" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Upload Document"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
