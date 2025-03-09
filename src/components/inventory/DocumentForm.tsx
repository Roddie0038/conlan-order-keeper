
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileUploader } from "./FileUploader";

interface DocumentFormProps {
  onDocumentSubmit: (document: {
    title: string;
    description: string;
    type: string;
    fileName?: string;
    fileSize: string;
  }) => void;
}

export function DocumentForm({ onDocumentSubmit }: DocumentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [docType, setDocType] = useState("inventory-update");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const documentTypes = [
    { value: "inventory-update", label: "Inventory Update" },
    { value: "supplier-invoice", label: "Supplier Invoice" },
    { value: "shipping-manifest", label: "Shipping Manifest" },
    { value: "quality-report", label: "Quality Report" },
    { value: "other", label: "Other Document" }
  ];

  const validateForm = (): boolean => {
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a document title",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedFile) {
      toast({
        title: "Missing File",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return false;
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a supported file format (XLSX, PDF, DOCX, CSV, JPG, PNG)",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    
    // Auto-fill the title with the file name if empty
    if (!title) {
      setTitle(file.name.split('.')[0]);
    }
  };

  const handleUpload = () => {
    if (!validateForm()) {
      return;
    }

    setUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      onDocumentSubmit({
        title,
        description,
        type: docType,
        fileSize: selectedFile ? formatFileSize(selectedFile.size) : `${Math.floor(Math.random() * 10) + 1} MB`,
        fileName: selectedFile?.name
      });
      
      setTitle("");
      setDescription("");
      setDocType("inventory-update");
      setSelectedFile(null);
      setUploading(false);
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded."
      });
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Inventory Document</CardTitle>
        <CardDescription>Upload documents related to inventory updates, invoices, or manifests.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Title</label>
          <Input 
            placeholder="Enter document title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-white"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Document Type</label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea 
            placeholder="Enter document description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-white"
            rows={3}
          />
        </div>
        
        <FileUploader
          selectedFile={selectedFile}
          onFileSelected={handleFileSelected}
        />
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={uploading || !selectedFile} 
          className={`w-full ${!selectedFile ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </CardFooter>
    </Card>
  );
}
