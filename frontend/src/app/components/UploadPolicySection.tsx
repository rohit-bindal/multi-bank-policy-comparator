"use client";

import { useState, useEffect } from "react";
import FileUploadArea from "./FileUploadArea";
import SelectedFilesList from "./SelectedFilesList";
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

interface UploadPolicySectionProps {
  onUploadComplete?: () => void;
}

export default function UploadPolicySection({ onUploadComplete }: UploadPolicySectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadSuccess(false);
    
    // Store original files before clearing
    const filesToUpload = [...selectedFiles];
    
    // Add files to storage with processing status
    const newStoredFiles = selectedFiles.map(file => storageService.addFile(file));
    
    // Clear selected files and switch to Added Policies tab
    setSelectedFiles([]);
    setUploading(false); // Stop showing "Uploading..." immediately
    
    // Switch to Added Policies tab
    if (onUploadComplete) {
      onUploadComplete();
    }
    
    // Process in background
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
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Update all files with error status
      newStoredFiles.forEach(storedFile => {
        storageService.updateFileResult(storedFile.id, {
          status: "failed",
          errorMessage: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      });
      
    } finally {
      // Background processing complete
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Upload Bank Policy Documents
        </h2>
        <p className="text-gray-600 text-sm">
          Upload PDF documents to extract bank information and fees using AI
        </p>
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-4">
        <FileUploadArea onFileSelect={handleFileSelect} />
        <SelectedFilesList files={selectedFiles} />
      </div>
    </div>
  );
}
