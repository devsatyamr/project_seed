import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface UploadSectionProps {
  onFileUpload?: (file: File) => void;
}

export default function UploadSection({ onFileUpload }: UploadSectionProps) {
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      onFileUpload?.(file);
    } else {
      alert('Please select a valid CSV file');
    }
  }, [onFileUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      onFileUpload?.(file);
    } else {
      alert('Please drop a valid CSV file');
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return (
    <div className="p-6 bg-midnight-800/50 rounded-lg shadow-xl backdrop-blur-sm border border-purple-900/20">
      <div
        className="border-2 border-dashed border-purple-900/50 rounded-lg p-8 transition-colors hover:border-neon-purple/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload className="w-12 h-12 text-neon-purple mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Upload Test Results</h3>
          <p className="text-gray-400 text-center mb-4">
            Drag and drop your CSV file here, or click to select
          </p>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="px-6 py-3 bg-purple-900 text-purple-100 rounded-lg hover:bg-purple-800 transition-colors inline-block">
              Select CSV File
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}