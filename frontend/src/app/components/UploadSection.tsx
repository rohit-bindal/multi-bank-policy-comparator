"use client";

import { useState } from "react";
import FileUploadArea from "./FileUploadArea";
import SelectedFilesList from "./SelectedFilesList";
import UploadButton from "./UploadButton";
import ProcessingModal from "./ProcessingModal";
import ResultsModal from "./ResultsModal";

interface BankInfo {
  bank_name: string;
  fees_and_charges: string;
}

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

export default function UploadSection() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<PDFProcessResult[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setProcessedCount(0);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      selectedFiles.forEach((file) => {
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
      
      // Set results and show modal
      setResults(data.results);
      setShowResults(true);
      setSelectedFiles([]);
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Show error results
      const errorResults: PDFProcessResult[] = selectedFiles.map(file => ({
        filename: file.name,
        status: "failed",
        error_message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      
      setResults(errorResults);
      setShowResults(true);
    } finally {
      setUploading(false);
      setProcessedCount(0);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Upload Bank Policy Documents
        </h2>
        
        <FileUploadArea onFileSelect={handleFileSelect} />
        <SelectedFilesList files={selectedFiles} />
        <UploadButton 
          onUpload={handleUpload}
          fileCount={selectedFiles.length}
          uploading={uploading}
        />
      </div>

      {/* Processing Modal */}
      <ProcessingModal 
        isOpen={uploading}
        fileCount={selectedFiles.length}
        processedCount={processedCount}
      />

      {/* Results Modal */}
      <ResultsModal 
        isOpen={showResults}
        results={results}
        onClose={() => setShowResults(false)}
      />
    </>
  );
}
