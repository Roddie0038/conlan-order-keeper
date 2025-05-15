
import { useState } from "react";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Document } from "@/hooks/useDocuments";
import { useImportData } from "./hooks/useImportData";
import { ImportItemsTable } from "./components/ImportItemsTable";
import { LoadingSpinner } from "./components/LoadingSpinner";

interface ImportPreviewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  documentId: string;
  documents: Document[];
  onImportComplete: () => void;
}

export function ImportPreviewDialog({
  isOpen,
  setIsOpen,
  documentId,
  documents,
  onImportComplete
}: ImportPreviewDialogProps) {
  const {
    importItems,
    loading,
    handleSelectAll,
    handleSelectItem,
    handleImport,
    selectedCount
  } = useImportData({ 
    isOpen, 
    documentId, 
    documents, 
    onImportComplete,
    setIsOpen 
  });

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Import Inventory Items</AlertDialogTitle>
          <AlertDialogDescription>
            Select the items you want to import from this document into your inventory.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {loading ? (
          <LoadingSpinner />
        ) : (
          <ImportItemsTable 
            importItems={importItems}
            handleSelectAll={handleSelectAll}
            handleSelectItem={handleSelectItem}
          />
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={handleImport}
              disabled={loading || selectedCount === 0}
            >
              Import Selected
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
