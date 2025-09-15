import LoadingSpinner from "./LoadingSpinner";

interface ProcessingModalProps {
  isOpen: boolean;
  fileCount: number;
  processedCount: number;
}

export default function ProcessingModal({ isOpen, fileCount, processedCount }: ProcessingModalProps) {
  if (!isOpen) return null;

  const progress = fileCount > 0 ? Math.round((processedCount / fileCount) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">
            Processing Bank Documents
          </h3>
          <p className="text-gray-600 mb-6">
            Analyzing {fileCount} PDF{fileCount !== 1 ? 's' : ''} with AI...
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-500">
            {processedCount} of {fileCount} files processed ({progress}%)
          </p>
        </div>
      </div>
    </div>
  );
}
