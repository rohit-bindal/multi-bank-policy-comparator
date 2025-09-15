interface TabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    { id: "upload", label: "Upload Policy" },
    { id: "added", label: "Added Policies" },
    { id: "comparator", label: "Comparator" }
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="bg-gray-200 rounded-lg p-1 flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-md font-medium transition-all ${
              activeTab === tab.id
                ? "bg-yellow-400 text-black shadow-md"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
