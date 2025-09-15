"use client";

import { useState, useEffect } from "react";
import FileUploadArea from "./FileUploadArea";
import SelectedFilesList from "./SelectedFilesList";
import UploadButton from "./UploadButton";
import UploadedFilesList from "./UploadedFilesList";
import FilePreviewModal from "./FilePreviewModal";
import { storageService, StoredFile, BankInfo } from "../services/storageService";

interface PDFProcessResult {
  filename: string;
  status: string;
  bank_info?: BankInfo;
  error_message?: string;
}

interface ProcessPDFsResponse {
  results: PDFProcessResult[];
  total_processed: number;
  successful: number;
  failed: number;
}

export default function UploadAndBanksSection() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [storedFiles, setStoredFiles] = useState<StoredFile[]>([]);
  const [previewFile, setPreviewFile] = useState<StoredFile | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load stored files on component mount
  useEffect(() => {
    setStoredFiles(storageService.getStoredFiles());
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    
    // Store original files before clearing
    const filesToUpload = [...selectedFiles];
    
    // Add files to storage with processing status
    const newStoredFiles = selectedFiles.map(file => storageService.addFile(file));
    setStoredFiles(storageService.getStoredFiles());
    
    // Clear selected files immediately to show they're being processed
    setSelectedFiles([]);
    
    try {
      // Create FormData for file upload  
      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append('files', file);
      });

      // Call the backend API
      const response = await fetch('http://localhost:8000/process-pdfs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProcessPDFsResponse = await response.json();
      
      // Update stored files with results
      data.results.forEach((result, index) => {
        const storedFile = newStoredFiles[index];
        if (storedFile) {
          storageService.updateFileResult(storedFile.id, {
            status: result.status as "success" | "failed",
            bankInfo: result.bank_info,
            errorMessage: result.error_message,
          });
        }
      });
      
      // Refresh stored files list
      setStoredFiles(storageService.getStoredFiles());
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Update all files with error status
      newStoredFiles.forEach(storedFile => {
        storageService.updateFileResult(storedFile.id, {
          status: "failed",
          errorMessage: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      });
      
      setStoredFiles(storageService.getStoredFiles());
    } finally {
      setUploading(false);
    }
  };

  const handleFileClick = (file: StoredFile) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleDeleteFile = (id: string) => {
    storageService.deleteFile(id);
    setStoredFiles(storageService.getStoredFiles());
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Upload Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Upload Bank Policies
            </h2>
            <p className="text-gray-600 mb-6">
              Upload PDF documents to extract bank information and fees
            </p>
          </div>
          
          <FileUploadArea onFileSelect={handleFileSelect} />
          <SelectedFilesList files={selectedFiles} />
          <UploadButton 
            onUpload={handleUpload}
            fileCount={selectedFiles.length}
            uploading={uploading}
          />
        </div>

        {/* Right Side - Uploaded Files List */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Your Bank Files
            </h2>
            <p className="text-gray-600 mb-6">
              Click on any file to view detailed analysis results
            </p>
          </div>
          
          <div className="border rounded-lg p-4 bg-gray-50 min-h-[400px]">
            <UploadedFilesList 
              files={storedFiles}
              onFileClick={handleFileClick}
              onDeleteFile={handleDeleteFile}
            />
          </div>
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
