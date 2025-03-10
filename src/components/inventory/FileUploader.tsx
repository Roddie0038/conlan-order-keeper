
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText } from "lucide-react";

interface FileUploaderProps {
  value?: File;
  onChange: (file: File) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  ref?: React.Ref<any>;
}

export function FileUploader({ value, onChange, disabled }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const selectedFile = value;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      onChange(file);
      
      toast({
        title: "File Selected",
        description: `${file.name} (${formatFileSize(file.size)})`,
      });
    }
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
      onChange(file);
      
      toast({
        title: "File Dropped",
        description: `${file.name} (${formatFileSize(file.size)})`,
      });
    }
  };

  return (
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
          disabled={disabled}
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
  );
}
