import { StoredFile } from "../services/storageService";

interface UploadedFilesListProps {
  files: StoredFile[];
  onDeleteFile: (id: string) => void;
  onUploadClick?: () => void;
}

export default function UploadedFilesList({ files, onDeleteFile, onUploadClick }: UploadedFilesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPolicyDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPolicyDateInfo = (file: StoredFile) => {
    if (!file.bankInfo) return null;
    
    // Prefer effective date over updated date
    if (file.bankInfo.effective_date) {
      return {
        date: formatPolicyDate(file.bankInfo.effective_date),
        label: 'Effective',
        source: 'effective_date'
      };
    }
    
    if (file.bankInfo.updated_date) {
      return {
        date: formatPolicyDate(file.bankInfo.updated_date),
        label: 'Updated',
        source: 'updated_date'
      };
    }
    
    return null;
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Files Uploaded</h3>
          <p className="text-gray-500">
            <button 
              onClick={onUploadClick}
              className="text-yellow-600 hover:text-yellow-700 underline underline-offset-2 font-medium transition-colors"
            >
              Upload your first bank policy document
            </button>
            {' '}to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Uploaded Files ({files.length})
        </h3>
        <button
          onClick={() => files.forEach(file => onDeleteFile(file.id))}
          className="text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className="border rounded-lg p-3 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {file.status === "processing" ? (
                    <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-yellow-600"></div>
                  ) : (
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.filename}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>•</span>
                    {(() => {
                      const policyDateInfo = getPolicyDateInfo(file);
                      if (policyDateInfo) {
                        return (
                          <span className="font-medium text-blue-600" title={`Policy ${policyDateInfo.label.toLowerCase()} date`}>
                            {policyDateInfo.label}: {policyDateInfo.date}
                          </span>
                        );
                      }
                      return <span title="Upload date">{formatDate(file.uploadDate)}</span>;
                    })()}
                    {file.bankInfo?.bank_name && file.bankInfo.is_valid_home_loan_mitc && (
                      <>
                        <span>•</span>
                        <span className="font-medium text-gray-700">{file.bankInfo.bank_name}</span>
                      </>
                    )}
                  </div>
                  {file.status === "success" && file.bankInfo && !file.bankInfo.is_valid_home_loan_mitc && (
                    <div 
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full cursor-help border border-red-200"
                      title={file.bankInfo.validation_reason || "Not a valid home loan MITC document"}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Invalid Document
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    file.status === "success"
                      ? "bg-green-100 text-green-800"
                      : file.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {file.status === "processing" ? "Processing..." : file.status.toUpperCase()}
                </span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
