"use client";

import { useState } from "react";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import UploadPolicySection from "./components/UploadPolicySection";
import AddedPoliciesSection from "./components/AddedPoliciesSection";
import ComparatorSection from "./components/ComparatorSection";

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  
  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-4xl mx-auto">
          <Header />
           <TabNavigation activeTab={activeTab} setActiveTab={handleTabChange} />
          
          {/* Tab Content Container with consistent sizing */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 relative overflow-hidden">
            {/* Subtle top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400"></div>
            
            {/* Consistent content area */}
            <div className="h-[450px] flex items-center justify-center p-6">
              <div className="w-full max-w-xl relative overflow-hidden h-full flex items-center justify-center">
          {activeTab === "upload" && (
            <UploadPolicySection onUploadComplete={() => handleTabChange("added")} />
          )}
          {activeTab === "added" && <AddedPoliciesSection onUploadClick={() => handleTabChange("upload")} />}
          {activeTab === "comparator" && <ComparatorSection onUploadClick={() => handleTabChange("upload")} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
