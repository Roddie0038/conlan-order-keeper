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
import { useInventoryContext } from "@/contexts/InventoryContext";
import { Document } from "@/hooks/useDocuments";
import { parseExcelFile, parseCSV } from "@/utils/excelParser";
import { supabase } from "@/integrations/supabase/extended-client";

interface ImportPreviewDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  documentId: string;
  documents: Document[];
  onImportComplete: () => void;
}

interface ImportItem {
  id: string;
  product_number: string;
  description: string;
  quantity: number;
  min_threshold: number;
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
  const { inventory, addInventoryItems } = useInventoryContext();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      
      const fetchDocumentAndParse = async () => {
        try {
          console.log(`Fetching document with ID: ${documentId}`);
          const document = documents.find(doc => doc.id === documentId);
          
          if (!document || !document.file_path) {
            throw new Error('Document not found or has no file path');
          }
          
          console.log(`Found document: ${document.title}, file path: ${document.file_path}`);
          
          // 1. Get a download URL for the file
          const { data: fileData, error: fileError } = await supabase.storage
            .from('inventory-docs')
            .download(document.file_path);
            
          if (fileError) {
            console.error('Error downloading file:', fileError);
            throw fileError;
          }
          
          console.log('File downloaded successfully, size:', fileData.size);
          
          // 2. Parse the file based on its type
          let parsedItems = [];
          const fileName = document.file_name?.toLowerCase() || '';
          
          if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
            console.log('Parsing Excel file');
            // Convert Blob to File with the original filename
            const file = new File([fileData], document.file_name || 'unknown.xlsx', {
              type: fileData.type,
              lastModified: Date.now(),
            });
            parsedItems = await parseExcelFile(file);
          } else if (fileName.endsWith('.csv')) {
            console.log('Parsing CSV file');
            const csvText = await fileData.text();
            parsedItems = parseCSV(csvText);
          } else {
            console.log('Unknown file type, attempting to parse as Excel');
            // For other file types, attempt to parse as Excel
            const file = new File([fileData], document.file_name || 'unknown.xlsx', {
              type: fileData.type,
              lastModified: Date.now(),
            });
            parsedItems = await parseExcelFile(file);
          }
          
          console.log('Parsed items:', parsedItems);
          
          // 3. Convert to ImportItem format
          const existingProductNumbers = new Set(inventory.map(item => item.product_number));
          
          const items: ImportItem[] = parsedItems.map(item => ({
            id: crypto.randomUUID(),
            product_number: item.product_number || '',
            description: item.description || '',
            quantity: typeof item.quantity === 'number' ? item.quantity : 0,
            min_threshold: typeof item.min_threshold === 'number' ? item.min_threshold : 5,
            // Pre-select new items that don't exist in inventory
            selected: !existingProductNumbers.has(item.product_number)
          }));
          
          console.log('Prepared import items:', items);
          setImportItems(items);
        } catch (error) {
          console.error("Error parsing document:", error);
          toast({
            title: "Import Error",
            description: "Failed to read document contents. Please try again or contact support.",
            variant: "destructive"
          });
          setImportItems([]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchDocumentAndParse();
    }
  }, [isOpen, documentId, documents, inventory, toast]);

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

  const handleImport = async () => {
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
    const itemsToImport = selectedItems.map(({ product_number, description, quantity, min_threshold }) => ({
      product_number,
      description,
      quantity,
      min_threshold
    }));
    
    console.log('Importing items:', itemsToImport);
    
    try {
      // Add to inventory
      await addInventoryItems(itemsToImport);
      
      toast({
        title: "Import Successful",
        description: `Added ${selectedItems.length} items to inventory.`
      });
      
      onImportComplete();
    } catch (error) {
      console.error("Error importing items:", error);
      toast({
        title: "Import Failed",
        description: "Failed to import selected items. Please try again.",
        variant: "destructive"
      });
    }
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
                      <TableCell>{item.product_number}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.min_threshold}</TableCell>
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
