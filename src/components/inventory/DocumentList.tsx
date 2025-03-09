
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, Trash2 } from "lucide-react";

export interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  fileSize: string;
  fileName?: string;
}

interface DocumentListProps {
  documents: Document[];
  onDelete: (id: string) => void;
}

export function DocumentList({ documents, onDelete }: DocumentListProps) {
  const documentTypes = [
    { value: "inventory-update", label: "Inventory Update" },
    { value: "supplier-invoice", label: "Supplier Invoice" },
    { value: "shipping-manifest", label: "Shipping Manifest" },
    { value: "quality-report", label: "Quality Report" },
    { value: "other", label: "Other Document" }
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="font-medium">Document Library</h3>
      </div>
      
      {documents.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <FileText className="mx-auto h-10 w-10 text-gray-400" />
          <p className="mt-2">No documents have been uploaded yet</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date Uploaded</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map(doc => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    {doc.title}
                    {doc.fileName && doc.fileName !== doc.title && (
                      <span className="ml-2 text-xs text-gray-500">({doc.fileName})</span>
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
                <TableCell>{doc.fileSize}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(doc.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
