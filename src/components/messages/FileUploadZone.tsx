import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  onCancel: () => void;
}

export function FileUploadZone({ onFilesSelected, onCancel }: FileUploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesSelected(acceptedFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Upload Files</span>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Drop files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Supports images, PDFs, Excel files (max 50MB)
        </p>
      </div>
    </div>
  );
}