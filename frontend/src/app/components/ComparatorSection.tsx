"use client";

import { useState, useEffect } from "react";
import EmptyState from "./EmptyState";
import { storageService, StoredFile } from "../services/storageService";

export default function ComparatorSection() {
  const [availableBanks, setAvailableBanks] = useState<StoredFile[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Load available banks on component mount
  useEffect(() => {
    const loadBanks = () => {
      const files = storageService.getStoredFiles();
      const successfulFiles = files.filter(file => 
        file.status === "success" && file.bankInfo?.bank_name
      );
      setAvailableBanks(successfulFiles);
    };

    loadBanks();
    
    // Refresh every 2 seconds to get newly processed files
    const interval = setInterval(loadBanks, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleBankToggle = (bankId: string) => {
    setSelectedBanks(prev => 
      prev.includes(bankId) 
        ? prev.filter(id => id !== bankId)
        : [...prev, bankId]
    );
  };

  const handleCompare = () => {
    if (selectedBanks.length >= 2) {
      const selectedBankData = availableBanks.filter(bank => 
        selectedBanks.includes(bank.id)
      );
      console.log("Comparing banks:", selectedBankData);
      // TODO: Implement comparison logic
      alert(`Comparing ${selectedBanks.length} banks: ${selectedBankData.map(b => b.bankInfo?.bank_name).join(", ")}`);
    }
  };

  const chartIcon = (
    <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );

  // Show empty state if no banks are available
  if (availableBanks.length === 0) {
    return (
      <EmptyState
        icon={chartIcon}
        title="No Banks Available"
        description="Upload and process some bank policy documents first to compare them here."
        buttonText="Go to Upload"
        onButtonClick={() => {}}
        buttonDisabled={false}
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Compare Bank Policies
        </h2>
        <p className="text-gray-600 text-sm">
          Select at least 2 banks to compare their policies and fees
        </p>
      </div>

      {/* Compact Bank Selection Section */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-gray-50 rounded-lg p-4">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Banks to Compare ({availableBanks.length} available)
          </label>
          
          {/* Multi-select Dropdown */}
          <div className="relative dropdown-container">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-700">
                  {selectedBanks.length === 0 
                    ? "Choose banks to compare..." 
                    : `${selectedBanks.length} bank${selectedBanks.length !== 1 ? 's' : ''} selected`
                  }
                </span>
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {availableBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleBankToggle(bank.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedBanks.includes(bank.id)}
                      onChange={() => {}} // Handled by parent onClick
                      className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">
                        {bank.bankInfo?.bank_name || "Unknown Bank"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bank.filename}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Banks Display */}
        {selectedBanks.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Selected Banks:</div>
            <div className="flex flex-wrap gap-2">
              {selectedBanks.map(bankId => {
                const bank = availableBanks.find(b => b.id === bankId);
                return (
                  <span
                    key={bankId}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
                  >
                    {bank?.bankInfo?.bank_name || "Unknown Bank"}
                    <button
                      onClick={() => handleBankToggle(bankId)}
                      className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-200 hover:bg-yellow-300 text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Compare Button */}
        <button
          onClick={handleCompare}
          disabled={selectedBanks.length < 2}
          className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedBanks.length >= 2
              ? "bg-yellow-400 text-black hover:bg-yellow-500 shadow-md"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {selectedBanks.length < 2 
            ? `Compare Banks (${selectedBanks.length}/2 minimum)` 
            : `Compare ${selectedBanks.length} Banks`
          }
        </button>
        
        {/* Info Section */}
        <div className="text-center text-gray-600 mt-4">
          <p className="text-xs">
            Select at least 2 banks from the dropdown above to start comparing.
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
