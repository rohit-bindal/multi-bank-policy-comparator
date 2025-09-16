"use client";

import { useState, useEffect } from "react";
import FileUploadArea from "./FileUploadArea";
import SelectedFilesList from "./SelectedFilesList";
import { storageService, StoredFile, BankInfo, FieldWithEvidence, Evidence } from "../services/storageService";

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
      const newFiles = Array.from(event.target.files);
      
      // Add new files to existing selection, avoiding duplicates based on name and size
      setSelectedFiles(prevFiles => {
        const existingFileKeys = new Set(
          prevFiles.map(file => `${file.name}-${file.size}-${file.lastModified}`)
        );
        
        const uniqueNewFiles = newFiles.filter(file => 
          !existingFileKeys.has(`${file.name}-${file.size}-${file.lastModified}`)
        );
        
        return [...prevFiles, ...uniqueNewFiles];
      });
    }
    
    // Reset the input value so the same files can be selected again if needed
    event.target.value = '';
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setSelectedFiles(files => files.filter((_, index) => index !== indexToRemove));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
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
    <div className="w-full h-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Upload Bank Policy Documents
        </h2>
        <p className="text-gray-600 text-sm">
          Upload PDF documents to extract bank information and fees using AI
        </p>
      </div>
      
      {/* Side-by-side layout */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left side - Upload area */}
        <div className="flex-1 flex flex-col justify-center">
          <FileUploadArea onFileSelect={handleFileSelect} />
          
          {/* Upload button section - only show when files are selected */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Process {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        
        {/* Right side - Selected files */}
        <div className="w-80 flex flex-col min-h-0">
          <SelectedFilesList 
            files={selectedFiles} 
            onRemoveFile={handleRemoveFile} 
            onClearAll={handleClearAll}
          />
        </div>
      </div>
    </div>
  );
}
