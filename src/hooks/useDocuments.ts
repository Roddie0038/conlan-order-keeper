
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  file_path: string;
  file_size: number;
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Since inventory_documents table doesn't exist, return empty array for now
      // This can be updated when the proper documents table is created
      setDocuments([]);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const uploadDocument = async (file: File, metadata: Omit<Document, 'id' | 'file_path' | 'file_size'>) => {
    try {
      setError(null);
      
      // This would be implemented when storage and documents table are set up
      console.log('Document upload would be implemented here', { file, metadata });
      
      // Refresh documents after upload
      await fetchDocuments();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document');
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      setError(null);
      
      // This would be implemented when documents table exists
      console.log('Document deletion would be implemented here', id);
      
      // Refresh documents after deletion
      await fetchDocuments();
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    refetch: fetchDocuments,
  };
}
