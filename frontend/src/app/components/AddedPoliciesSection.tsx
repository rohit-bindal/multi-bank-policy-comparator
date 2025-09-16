"use client";

import { useState, useEffect } from "react";
import UploadedFilesList from "./UploadedFilesList";
import { storageService, StoredFile } from "../services/storageService";

interface AddedPoliciesSectionProps {
  onUploadClick?: () => void;
}

export default function AddedPoliciesSection({ onUploadClick }: AddedPoliciesSectionProps) {
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);

  // Load stored files on component mount and set up refresh interval
  useEffect(() => {
    const loadFiles = () => {
      setStoredFiles(storageService.getStoredFiles());
    };

    loadFiles();
    
    // Refresh every 2 seconds to show processing updates
    const interval = setInterval(loadFiles, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDeleteFile = (id: string) => {
    storageService.deleteFile(id);
    setStoredFiles(storageService.getStoredFiles());
  };

  const processingCount = storedFiles.filter(file => file.status === "processing").length;
  const successCount = storedFiles.filter(file => file.status === "success").length;
  const failedCount = storedFiles.filter(file => file.status === "failed").length;

  return (
    <>
      <div className="w-full h-full flex flex-col">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Your Bank Policies
          </h2>
          <p className="text-gray-600 text-sm">
            View and manage all your uploaded bank policy documents
          </p>
        </div>

        {/* Compact Summary Stats */}
        {storedFiles.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-gray-600">{storedFiles.length}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">{successCount}</div>
              <div className="text-xs text-green-600">Success</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-600">{processingCount}</div>
              <div className="text-xs text-yellow-600">Processing</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-600">{failedCount}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
          </div>
        )}

        {/* Compact Processing Alert */}
        {processingCount > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
              <span className="text-blue-800 text-sm font-medium">
                {processingCount} file{processingCount !== 1 ? 's' : ''} processing...
              </span>
            </div>
          </div>
        )}
        
        {/* Compact Files List */}
        <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
          <UploadedFilesList 
            files={storedFiles}
            onDeleteFile={handleDeleteFile}
            onUploadClick={onUploadClick}
          />
        </div>
      </div>
    </>
  );
}
