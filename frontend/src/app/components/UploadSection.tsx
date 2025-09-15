"use client";

import { useState } from "react";
import FileUploadArea from "./FileUploadArea";
import SelectedFilesList from "./SelectedFilesList";
import UploadButton from "./UploadButton";

export default function UploadSection() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    // TODO: Implement upload logic
    console.log("Uploading files:", selectedFiles);
    
    // Simulate upload delay
    setTimeout(() => {
      setUploading(false);
      setSelectedFiles([]);
    }, 2000);
  };

  return (
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
  );
}
