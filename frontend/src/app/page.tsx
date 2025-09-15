"use client";

import { useState } from "react";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import UploadPolicySection from "./components/UploadPolicySection";
import AddedPoliciesSection from "./components/AddedPoliciesSection";
import ComparatorSection from "./components/ComparatorSection";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl">
        <Header />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeTab === "upload" && (
            <UploadPolicySection onUploadComplete={() => setActiveTab("added")} />
          )}
          {activeTab === "added" && <AddedPoliciesSection />}
          {activeTab === "comparator" && <ComparatorSection />}
        </div>
      </div>
    </div>
  );
}
