
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText, Trash2 } from "lucide-react";

interface Document {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string;
  fileSize: string;
  fileName?: string; // Add fileName to store the original file name
}

export function DocumentUpload() {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('inventoryDocuments');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [docType, setDocType] = useState("inventory-update");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Auto-fill the title with the file name if empty
      if (!title) {
        setTitle(file.name.split('.')[0]);
      }
      
      toast({
        title: "File Selected",
        description: `${file.name} (${formatFileSize(file.size)})`,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      
      // Auto-fill the title with the file name if empty
      if (!title) {
        setTitle(file.name.split('.')[0]);
      }
      
      toast({
        title: "File Dropped",
        description: `${file.name} (${formatFileSize(file.size)})`,
      });
    }
  };

  const validateFile = (file: File | null): boolean => {
    if (!file) {
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

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a supported file format (XLSX, PDF, DOCX, CSV, JPG, PNG)",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleUpload = () => {
    if (!title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a document title",
        variant: "destructive"
      });
      return;
    }

    if (!validateFile(selectedFile)) {
      return;
    }

    setUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const newDocument: Document = {
        id: crypto.randomUUID(),
        title,
        description,
        type: docType,
        date: new Date().toISOString(),
        fileSize: selectedFile ? formatFileSize(selectedFile.size) : `${Math.floor(Math.random() * 10) + 1} MB`,
        fileName: selectedFile?.name
      };

      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      localStorage.setItem('inventoryDocuments', JSON.stringify(updatedDocuments));
      
      setTitle("");
      setDescription("");
      setDocType("inventory-update");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploading(false);
      
      toast({
        title: "Document Uploaded",
        description: "Your document has been successfully uploaded."
      });
    }, 1500);
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

  const documentTypes = [
    { value: "inventory-update", label: "Inventory Update" },
    { value: "supplier-invoice", label: "Supplier Invoice" },
    { value: "shipping-manifest", label: "Shipping Manifest" },
    { value: "quality-report", label: "Quality Report" },
    { value: "other", label: "Other Document" }
  ];

  return (
    <div className="space-y-8">
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium">File</label>
            <div 
              className={`border-2 border-dashed ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'} rounded-lg p-8 text-center cursor-pointer`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleSelectFileClick}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept=".xlsx,.xls,.pdf,.doc,.docx,.csv,.jpg,.jpeg,.png"
              />
              {selectedFile ? (
                <>
                  <FileText className="mx-auto h-10 w-10 text-green-500" />
                  <p className="mt-2 text-sm font-medium text-green-700">
                    {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                  <p className="mt-1 text-xs text-green-600">
                    File selected - click to change
                  </p>
                </>
              ) : (
                <>
                  <FileUp className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Drag and drop file here, or click to select file
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Supported formats: XLSX, PDF, DOCX, CSV, JPG, PNG
                  </p>
                </>
              )}
              {!selectedFile && (
                <Button variant="outline" className="mt-3" onClick={(e) => {
                  e.stopPropagation();
                  handleSelectFileClick();
                }}>
                  Select File
                </Button>
              )}
            </div>
          </div>
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
                      onClick={() => handleDelete(doc.id)}
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
    </div>
  );
}
