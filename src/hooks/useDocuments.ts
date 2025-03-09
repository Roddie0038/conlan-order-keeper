
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
  const { toast } = useToast();

  const refreshDocuments = async () => {
    try {
      setLoading(true);
      console.log('Fetching documents from Supabase...');
      
      const { data, error } = await supabase
        .from('inventory_documents')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log('Documents fetched:', data);
      setDocuments(data as Document[]);
    } catch (err) {
      console.error('Failed to load documents:', err);
      toast({
        title: "Error",
        description: "Failed to load documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      // First get the document to find its file path
      const { data, error: fetchError } = await supabase
        .from('inventory_documents')
        .select('file_path')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      if (data.file_path) {
        // Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from('inventory-docs')
          .remove([data.file_path]);

        if (storageError) throw storageError;
      }

      // Delete the document record
      const { error: deleteError } = await supabase
        .from('inventory_documents')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setDocuments(documents.filter(doc => doc.id !== id));
      
      toast({
        title: "Document Deleted",
        description: "The document has been removed successfully.",
      });
    } catch (err) {
      console.error('Error deleting document:', err);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Load documents on component mount
  useEffect(() => {
    console.log('useDocuments hook initialized, fetching documents');
    refreshDocuments();
  }, []);

  return {
    documents,
    loading,
    deleteDocument,
    refreshDocuments
  };
}
