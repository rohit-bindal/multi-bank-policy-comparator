import { StoredFile, FieldWithEvidence } from "../services/storageService";
import { getFieldDisplayNames } from "../config/fields";

interface ComparisonDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  bank: StoredFile | null;
  fieldName: string;
  fieldData: FieldWithEvidence | null;
  status: string;
  explanation: string;
  details?: string;
}

export default function ComparisonDetailModal({ 
  isOpen, 
  onClose, 
  bank, 
  fieldName, 
  fieldData, 
  status, 
  explanation, 
  details 
}: ComparisonDetailModalProps) {
  if (!isOpen || !bank || !fieldData) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SAME':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'DIFF':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MISSING':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'SUSPECT':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const fieldDisplayNames = getFieldDisplayNames();


  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
            title="Back to comparison table"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            {status}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {fieldDisplayNames[fieldName] || fieldName}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {/* Bank Info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="font-medium text-gray-900 mb-2">{bank.bankInfo?.bank_name}</h4>
          <p className="text-sm text-gray-600">{bank.filename}</p>
        </div>

        {/* Analysis */}
        {explanation && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-2">Analysis</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
            {details && (
              <p className="text-sm text-gray-600 mt-2 italic">{details}</p>
            )}
          </div>
        )}

        {/* Content */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Content</h4>
          {fieldData.missing ? (
            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-gray-300">
              <p className="text-sm text-gray-600 italic">No information found for this field</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {fieldData.content}
              </p>
            </div>
          )}
        </div>

        {/* Evidence */}
        {fieldData.evidence && fieldData.evidence.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              Evidence ({fieldData.evidence.length})
            </h4>
            <div className="space-y-2">
              {fieldData.evidence.map((evidence, index) => (
                <div key={index} className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-amber-800">#{index + 1}</span>
                    {evidence.page_number && (
                      <span className="text-xs text-amber-700 bg-amber-200 px-2 py-1 rounded">
                        Page {evidence.page_number}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    &ldquo;{evidence.line_snippet}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
