
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: string;
  title: string;
  description: string | null;
  type: string;
  date: string;
  file_name: string | null;
  file_size: string | null;
  file_path: string | null;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_documents')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setDocuments(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
      toast({
        title: 'Error',
        description: 'Failed to load documents. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (documentData: {
    title: string;
    description: string | null;
    type: string;
    file_name: string | null;
    file_size: string | null;
    file_path: string | null;
  }) => {
    try {
      const { data, error } = await supabase
        .from('inventory_documents')
        .insert([
          {
            ...documentData,
            date: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      // Refresh documents list
      await fetchDocuments();
      
      toast({
        title: "Document Added",
        description: "Document has been successfully saved."
      });

      return data[0];
    } catch (err: any) {
      console.error('Error adding document:', err);
      toast({
        title: 'Error',
        description: 'Failed to add document. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      // First check if there's a file associated with this document
      const document = documents.find(doc => doc.id === id);
      
      if (document?.file_path) {
        // Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from('inventory-docs')
          .remove([document.file_path]);
          
        if (storageError) {
          console.error('Error deleting file from storage:', storageError);
          // Continue with document deletion even if file deletion fails
        }
      }
      
      // Delete the document record
      const { error } = await supabase
        .from('inventory_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Document Deleted",
        description: "Document has been removed."
      });
    } catch (err: any) {
      console.error('Error deleting document:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete document. Please try again.',
        variant: 'destructive'
      });
      throw err;
    }
  };

  // Load initial documents
  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    addDocument,
    deleteDocument
  };
}
