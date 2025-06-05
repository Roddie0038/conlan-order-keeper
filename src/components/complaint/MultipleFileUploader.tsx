
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText, X } from "lucide-react";

interface MultipleFileUploaderProps {
  value?: File[];
  onChange: (files: File[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
  name?: string;
  maxFiles?: number;
}

export function MultipleFileUploader({ 
  value = [], 
  onChange, 
  disabled, 
  maxFiles = 10 
}: MultipleFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const selectedFiles = value;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files].slice(0, maxFiles);
      onChange(newFiles);
      
      toast({
        title: `${files.length} file(s) added`,
        description: `Total: ${newFiles.length} file(s) selected`
      });
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onChange(newFiles);
    
    toast({
      title: "File removed",
      description: "File has been removed from selection"
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newFiles = [...selectedFiles, ...files].slice(0, maxFiles);
      onChange(newFiles);
      
      toast({
        title: `${files.length} file(s) dropped`,
        description: `Total: ${newFiles.length} file(s) selected`
      });
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Attachments (Optional)</label>
      
      {/* File Drop Zone */}
      <div 
        className={`border-2 border-dashed ${selectedFiles.length > 0 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'} rounded-lg p-6 text-center cursor-pointer`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleSelectFileClick}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xlsx,.xls"
          disabled={disabled}
          multiple
        />
        
        <FileUp className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">
          Drag and drop files here, or click to select files
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Supported: PDF, DOC, DOCX, JPG, PNG, GIF, XLSX, XLS (Max: {maxFiles} files)
        </p>
        
        <Button variant="outline" className="mt-3" onClick={(e) => {
          e.stopPropagation();
          handleSelectFileClick();
        }}>
          Select Files
        </Button>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Selected Files ({selectedFiles.length})</p>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
