import { StoredFile } from "../services/storageService";

interface FilePreviewModalProps {
  isOpen: boolean;
  file: StoredFile | null;
  onClose: () => void;
}

export default function FilePreviewModal({ isOpen, file, onClose }: FilePreviewModalProps) {
  if (!isOpen || !file) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">File Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* File Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Filename</label>
              <p className="text-gray-900 font-medium">{file.filename}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">File Size</label>
              <p className="text-gray-900">{formatFileSize(file.fileSize)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Upload Date</label>
              <p className="text-gray-900">{formatDate(file.uploadDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span
                className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                  file.status === "success"
                    ? "bg-green-100 text-green-800"
                    : file.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {file.status === "processing" ? "Processing..." : file.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Processing Results */}
        {file.status === "success" && file.bankInfo && (
          <div className="space-y-6">
            <div>
              <label className="text-lg font-semibold text-gray-800 mb-2 block">Bank Information</label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="mb-4">
                  <label className="text-sm font-medium text-green-700">Bank Name</label>
                  <p className="text-green-900 font-semibold text-lg">{file.bankInfo.bank_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-green-700">Fees and Charges</label>
                  <div className="mt-2 p-3 bg-white rounded border">
                    <p className="text-green-900 whitespace-pre-wrap text-sm leading-relaxed">
                      {file.bankInfo.fees_and_charges}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {file.status === "failed" && (
          <div>
            <label className="text-lg font-semibold text-gray-800 mb-2 block">Error Details</label>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-900">{file.errorMessage}</p>
            </div>
          </div>
        )}

        {file.status === "processing" && (
          <div className="text-center py-8">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-yellow-600 mx-auto mb-4"></div>
            <p className="text-gray-600">This file is still being processed...</p>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-yellow-400 text-black rounded-lg font-medium hover:bg-yellow-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
