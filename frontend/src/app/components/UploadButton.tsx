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
        disabled={fileCount === 0 || uploading}
        className={`px-8 py-3 rounded-lg font-medium transition-all ${
          fileCount === 0 || uploading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-yellow-400 text-black hover:bg-yellow-500 shadow-md"
        }`}
      >
        {uploading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          `Upload ${fileCount} Files`
        )}
      </button>
    </div>
  );
}
