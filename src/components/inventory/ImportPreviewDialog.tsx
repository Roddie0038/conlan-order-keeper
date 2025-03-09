
import { useState, useEffect } from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/useInventory";
import { Document } from "./DocumentList";

interface ImportPreviewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  documentId: string;
  documents: Document[];
  onImportComplete: () => void;
}

interface ImportItem {
  id: string;
  productNumber: string;
  description: string;
  quantity: number;
  minThreshold: number;
  selected: boolean;
}

export function ImportPreviewDialog({
  isOpen,
  setIsOpen,
  documentId,
  documents,
  onImportComplete
}: ImportPreviewDialogProps) {
  const [importItems, setImportItems] = useState<ImportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { inventory, handleAddImportedItems } = useInventory();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      // Simulate fetching document data
      setTimeout(() => {
        const document = documents.find(doc => doc.id === documentId);
        
        if (document) {
          // Generate mock data based on document title/type
          const mockItems: ImportItem[] = generateMockImportItems(document, inventory);
          setImportItems(mockItems);
        }
        
        setLoading(false);
      }, 1000);
    }
  }, [isOpen, documentId, documents, inventory]);

  const generateMockImportItems = (document: Document, existingInventory: any[]): ImportItem[] => {
    // In a real app, this would parse the actual document content
    // For this demo, we'll generate mock data based on the document title
    const existingProductNumbers = new Set(existingInventory.map(item => item.productNumber));
    
    const numItems = 3 + Math.floor(Math.random() * 4); // 3-6 items
    const mockItems: ImportItem[] = [];
    
    for (let i = 0; i < numItems; i++) {
      const productNumber = `PT-${1000 + Math.floor(Math.random() * 9000)}`;
      
      mockItems.push({
        id: crypto.randomUUID(),
        productNumber,
        description: `${document.title} - Item ${i + 1}`,
        quantity: 5 + Math.floor(Math.random() * 20),
        minThreshold: 3 + Math.floor(Math.random() * 5),
        // Pre-select items that don't already exist in inventory
        selected: !existingProductNumbers.has(productNumber)
      });
    }
    
    return mockItems;
  };

  const handleSelectAll = (checked: boolean) => {
    setImportItems(importItems.map(item => ({
      ...item,
      selected: checked
    })));
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    setImportItems(importItems.map(item => 
      item.id === id ? { ...item, selected: checked } : item
    ));
  };

  const handleImport = () => {
    const selectedItems = importItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item to import.",
        variant: "destructive"
      });
      return;
    }
    
    // Map to inventory format
    const inventoryItems = selectedItems.map(item => ({
      id: crypto.randomUUID(),
      productNumber: item.productNumber,
      description: item.description,
      quantity: item.quantity,
      minThreshold: item.minThreshold,
      lastUpdated: new Date().toISOString(),
      lowStock: item.quantity <= item.minThreshold
    }));
    
    // Add to inventory
    handleAddImportedItems(inventoryItems);
    
    toast({
      title: "Import Successful",
      description: `Added ${selectedItems.length} items to inventory.`
    });
    
    onImportComplete();
  };

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
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={importItems.length > 0 && importItems.every(item => item.selected)}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead>Product #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Min Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No items found in this document
                    </TableCell>
                  </TableRow>
                ) : (
                  importItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Checkbox 
                          checked={item.selected}
                          onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>{item.productNumber}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.minThreshold}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              onClick={handleImport}
              disabled={loading || importItems.filter(item => item.selected).length === 0}
            >
              Import Selected
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
