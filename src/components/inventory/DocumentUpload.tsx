
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { DocumentForm } from "./DocumentForm";
import { DocumentList } from "./DocumentList";
import { ImportPreviewDialog } from "./ImportPreviewDialog";
import { useInventoryContext } from "@/contexts/InventoryContext";
import { useDocuments } from "@/hooks/useDocuments";

export function DocumentUpload() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { toast } = useToast();
  const { addInventoryItems, refreshInventory } = useInventoryContext();
  const { documents, loading, deleteDocument, refreshDocuments } = useDocuments();

  const handleDelete = (id: string) => {
    deleteDocument(id);
  };

  const handleImport = (id: string) => {
    console.log(`Opening import dialog for document ID: ${id}`);
    setSelectedDocumentId(id);
    setIsImportDialogOpen(true);
  };

  const handleImportComplete = () => {
    console.log('Import complete, refreshing inventory');
    setIsImportDialogOpen(false);
    setSelectedDocumentId(null);
    // Refresh inventory after import
    refreshInventory();
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <DocumentList 
          documents={documents} 
          loading={loading}
          onDelete={handleDelete} 
          onImport={handleImport}
        />
      </div>
      <div className="bg-white rounded-lg shadow">
        <DocumentForm onFormSubmitted={refreshDocuments} />
      </div>

      {selectedDocumentId && (
        <ImportPreviewDialog
          isOpen={isImportDialogOpen}
          setIsOpen={setIsImportDialogOpen}
          documentId={selectedDocumentId}
          documents={documents}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
}
