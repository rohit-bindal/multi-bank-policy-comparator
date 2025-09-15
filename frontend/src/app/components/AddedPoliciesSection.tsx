"use client";

import { useState, useEffect } from "react";
import UploadedFilesList from "./UploadedFilesList";
import FilePreviewModal from "./FilePreviewModal";
import { storageService, StoredFile } from "../services/storageService";

export default function AddedPoliciesSection() {
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleFileClick = (file: StoredFile) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleDeleteFile = (id: string) => {
    storageService.deleteFile(id);
    setStoredFiles(storageService.getStoredFiles());
  };

  const processingCount = storedFiles.filter(file => file.status === "processing").length;
  const successCount = storedFiles.filter(file => file.status === "success").length;
  const failedCount = storedFiles.filter(file => file.status === "failed").length;

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Your Bank Policies
          </h2>
          <p className="text-gray-600">
            View and manage all your uploaded bank policy documents
          </p>
        </div>

        {/* Summary Stats */}
        {storedFiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">{storedFiles.length}</div>
              <div className="text-sm text-gray-500">Total Files</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-green-600">Processed</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{processingCount}</div>
              <div className="text-sm text-yellow-600">Processing</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <div className="text-sm text-red-600">Failed</div>
            </div>
          </div>
        )}

        {/* Processing Alert */}
        {processingCount > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
              <span className="text-blue-800 font-medium">
                {processingCount} file{processingCount !== 1 ? 's' : ''} currently being processed...
              </span>
            </div>
            <p className="text-blue-600 text-sm mt-1">
              Results will appear automatically as processing completes.
            </p>
          </div>
        )}
        
        {/* Files List */}
        <div className="bg-gray-50 rounded-lg p-6">
          <UploadedFilesList 
            files={storedFiles}
            onFileClick={handleFileClick}
            onDeleteFile={handleDeleteFile}
          />
        </div>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal 
        isOpen={showPreview}
        file={previewFile}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}
