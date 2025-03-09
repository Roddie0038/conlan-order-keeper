
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DocumentForm } from "./DocumentForm";
import { DocumentList, Document } from "./DocumentList";

export function DocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('inventoryDocuments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const { toast } = useToast();

  const handleDocumentSubmit = (documentData: {
    title: string;
    description: string;
    type: string;
    fileName?: string;
    fileSize: string;
  }) => {
    const newDocument: Document = {
      id: crypto.randomUUID(),
      title: documentData.title,
      description: documentData.description,
      type: documentData.type,
      date: new Date().toISOString(),
      fileSize: documentData.fileSize,
      fileName: documentData.fileName
    };

    const updatedDocuments = [...documents, newDocument];
    setDocuments(updatedDocuments);
    localStorage.setItem('inventoryDocuments', JSON.stringify(updatedDocuments));
  };

  const handleDelete = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocuments);
    localStorage.setItem('inventoryDocuments', JSON.stringify(updatedDocuments));
    
    toast({
      title: "Document Deleted",
      description: "Document has been removed."
    });
  };

  return (
    <div className="space-y-8">
      <DocumentForm onDocumentSubmit={handleDocumentSubmit} />
      <DocumentList documents={documents} onDelete={handleDelete} />
    </div>
  );
}
