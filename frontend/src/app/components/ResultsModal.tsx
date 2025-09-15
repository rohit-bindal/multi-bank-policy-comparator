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

interface ResultsModalProps {
  isOpen: boolean;
  results: PDFProcessResult[];
  onClose: () => void;
}

export default function ResultsModal({ isOpen, results, onClose }: ResultsModalProps) {
  if (!isOpen) return null;

  const successCount = results.filter(r => r.status === "success").length;
  const failedCount = results.length - successCount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Processing Results</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{results.length}</div>
            <div className="text-sm text-blue-600">Total Files</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-green-600">Successful</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                result.status === "success" 
                  ? "border-green-200 bg-green-50" 
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{result.filename}</h4>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    result.status === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {result.status.toUpperCase()}
                </span>
              </div>
              
              {result.status === "success" && result.bank_info && (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Bank: </span>
                    <span className="text-gray-600">{result.bank_info.bank_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fees & Charges: </span>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-3">
                      {result.bank_info.fees_and_charges}
                    </p>
                  </div>
                </div>
              )}
              
              {result.status === "failed" && (
                <div className="text-red-600 text-sm">
                  <span className="font-medium">Error: </span>
                  {result.error_message}
                </div>
              )}
            </div>
          ))}
        </div>

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
