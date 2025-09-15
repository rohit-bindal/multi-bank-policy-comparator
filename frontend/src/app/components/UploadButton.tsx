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
        {uploading ? "Processing..." : `Upload ${fileCount} Files`}
      </button>
    </div>
  );
}
