
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileUp, FileText, X } from "lucide-react";

interface MultipleFileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxFileSize?: number;
  selectedFiles?: File[];
}

export function MultipleFileUploader({ 
  onFilesSelected, 
  acceptedFileTypes = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  selectedFiles = []
}: MultipleFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    // Check file count limit
    if (selectedFiles.length + files.length > maxFiles) {
      toast({
        title: "Too Many Files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }
    
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File Too Large",
        description: `Maximum file size is ${formatFileSize(maxFileSize)}`,
        variant: "destructive"
      });
      return;
    }
    
    onFilesSelected([...selectedFiles, ...files]);
    
    toast({
      title: "Files Selected",
      description: `${files.length} file(s) added`
    });
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesSelected(newFiles);
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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileChange({ target: { files } } as any);
    }
  };

  const acceptString = Object.values(acceptedFileTypes).flat().join(',');

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Attachments</label>
      <div 
        className={`border-2 border-dashed ${selectedFiles.length > 0 ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'} rounded-lg p-8 text-center cursor-pointer`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleSelectFileClick}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
          accept={acceptString}
          multiple
        />
        {selectedFiles.length > 0 ? (
          <>
            <FileText className="mx-auto h-10 w-10 text-green-500" />
            <p className="mt-2 text-sm font-medium text-green-700">
              {selectedFiles.length} file(s) selected
            </p>
            <p className="mt-1 text-xs text-green-600">
              Click to add more files (max {maxFiles})
            </p>
          </>
        ) : (
          <>
            <FileUp className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">
              Drag and drop files here, or click to select files
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Supported formats: Images, PDF, DOC, DOCX (max {formatFileSize(maxFileSize)})
            </p>
          </>
        )}
        {selectedFiles.length === 0 && (
          <Button variant="outline" className="mt-3" onClick={(e) => {
            e.stopPropagation();
            handleSelectFileClick();
          }}>
            Select Files
          </Button>
        )}
      </div>
      
      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {file.name} ({formatFileSize(file.size)})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
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
