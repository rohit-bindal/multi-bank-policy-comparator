interface FileUploadAreaProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploadArea({ onFileSelect }: FileUploadAreaProps) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-6 hover:border-yellow-400 transition-colors">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="mb-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <span className="text-yellow-600 font-medium hover:text-yellow-500">
            Click to upload
          </span>
          <span className="text-gray-600"> or drag and drop</span>
        </label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".pdf"
          onChange={onFileSelect}
          className="hidden"
        />
      </div>
      <p className="text-sm text-gray-500">PDF files only, up to 10MB each</p>
    </div>
  );
}
