interface UploadButtonProps {
  onUpload: () => void;
  fileCount: number;
  uploading: boolean;
}

export default function UploadButton({ onUpload, fileCount, uploading }: UploadButtonProps) {
  return (
    <div className="text-center">
      <button
        onClick={onUpload}
        disabled={uploading}
        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
          uploading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-600 hover:shadow-md shadow-sm"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-700"></div>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 12l2 2 4-4" />
            </svg>
            <span>
              {fileCount === 0 ? 'Upload Files' : `Analyze ${fileCount} File${fileCount !== 1 ? 's' : ''}`}
            </span>
          </div>
        )}
      </button>
    </div>
  );
}
