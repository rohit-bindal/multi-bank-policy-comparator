interface SelectedFilesListProps {
  files: File[];
  onRemoveFile?: (index: number) => void;
  onClearAll?: () => void;
}

export default function SelectedFilesList({ files, onRemoveFile, onClearAll }: SelectedFilesListProps) {
  if (files.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">No files selected</p>
          <p className="text-xs mt-1">Select files to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-800">Selected Files</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        {onClearAll && files.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Clear all files
          </button>
        )}
      </div>
      
      {/* Scrollable container that takes full height */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-white">
        <div className="divide-y divide-gray-100">
          {files.map((file, index) => (
            <div key={index} className="flex items-start p-3 hover:bg-gray-50 transition-colors">
              <svg className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-700 break-words" title={file.name}>
                  {file.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              
              {onRemoveFile && (
                <button
                  onClick={() => onRemoveFile(index)}
                  className="ml-2 p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                  title="Remove file"
                >
                  <svg className="h-4 w-4 text-gray-400 hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {files.length > 4 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Scroll to see all files
        </div>
      )}
    </div>
  );
}
