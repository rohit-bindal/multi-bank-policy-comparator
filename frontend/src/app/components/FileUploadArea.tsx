interface FileUploadAreaProps {
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploadArea({ onFileSelect }: FileUploadAreaProps) {
  return (
    <div className="relative group">
      {/* Compact upload area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-50/30 bg-gray-50/30 group-hover:shadow-md">
        {/* Icon container */}
        <div className="mb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <svg className="h-6 w-6 text-yellow-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Upload text */}
        <div className="mb-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="font-semibold text-gray-800 mb-1">
              Drop your documents here
            </div>
            <div className="text-sm text-gray-600">
              or{' '}
              <span className="text-yellow-600 font-medium hover:text-yellow-700 underline underline-offset-2 transition-colors">
                browse to upload
              </span>
            </div>
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

        {/* File requirements */}
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <span>PDF files only</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span>Up to 10MB each</span>
          </div>
        </div>
      </div>
    </div>
  );
}
