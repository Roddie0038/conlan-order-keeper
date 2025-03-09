
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Import } from "lucide-react";
import { Document } from "@/hooks/useDocuments";

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onDelete: (id: string) => void;
  onImport?: (id: string) => void;
}

export function DocumentList({ documents, loading, onDelete, onImport }: DocumentListProps) {
  const documentTypes = [
    { value: "inventory-update", label: "Inventory Update" },
    { value: "supplier-invoice", label: "Supplier Invoice" },
    { value: "shipping-manifest", label: "Shipping Manifest" },
    { value: "quality-report", label: "Quality Report" },
    { value: "other", label: "Other Document" }
  ];

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <div className="p-4 bg-primary/5 border-b">
          <h3 className="font-semibold text-lg">Recent Documents</h3>
        </div>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="p-4 bg-primary/5 border-b">
        <h3 className="font-semibold text-lg">Recent Documents</h3>
      </div>
      
      {documents.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium">No documents uploaded</p>
          <p className="text-sm text-gray-400 mt-1">Upload inventory documents to get started</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Date Uploaded</TableHead>
              <TableHead className="font-semibold">Size</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map(doc => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    {doc.title}
                    {doc.file_name && doc.file_name !== doc.title && (
                      <span className="ml-2 text-xs text-gray-500">({doc.file_name})</span>
                    )}
                  </div>
                  {doc.description && (
                    <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
                  )}
                </TableCell>
                <TableCell>
                  {documentTypes.find(type => type.value === doc.type)?.label || doc.type}
                </TableCell>
                <TableCell>{new Date(doc.date).toLocaleString()}</TableCell>
                <TableCell>{doc.file_size}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    {onImport && doc.type === "inventory-update" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onImport(doc.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Import size={16} className="mr-1" />
                        <span>Import</span>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(doc.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
