import EmptyState from "./EmptyState";

export default function BanksSection() {
  const bankIcon = (
    <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  return (
    <EmptyState
      icon={bankIcon}
      title="No Banks Added Yet"
      description="Upload some bank policy documents to see them here."
      buttonText="Upload Your First Policy"
      onButtonClick={() => {}}
    />
  );
}
