import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState('');

  const validateFile = (file: File): boolean => {
    if (!file.type || file.type !== 'application/pdf') {
      setDragError('Please upload a PDF file');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDragError('File size must be less than 10MB');
      return false;
    }
    setDragError('');
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && validateFile(files[0])) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div
        className={`p-8 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer bg-white/50 backdrop-blur-sm
          ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-gray-300 hover:border-blue-500'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-600' : 'text-blue-500'}`} />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">
              Drag and drop your PDF here
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select a file
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Maximum file size: 10MB
            </p>
          </div>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            accept=".pdf,application/pdf"
            onChange={handleFileInput}
          />
        </div>
      </div>
      
      {dragError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-600 text-sm">{dragError}</p>
        </div>
      )}
    </div>
  );
}