interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  buttonDisabled?: boolean;
}

export default function EmptyState({ 
  icon, 
  title, 
  description, 
  buttonText, 
  onButtonClick, 
  buttonDisabled = false 
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        {icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
      <p className="text-gray-600 mb-8">{description}</p>
      {buttonText && (
        <button
          onClick={onButtonClick}
          disabled={buttonDisabled}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            buttonDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-yellow-400 text-black hover:bg-yellow-500"
          }`}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
