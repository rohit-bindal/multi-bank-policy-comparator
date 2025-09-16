"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ComparisonDetailModal from "./ComparisonDetailModal";
import { 
  storageService, 
  StoredFile, 
  BankComparisonRequest, 
  BankComparisonResponse,
  BankComparisonCell,
  FieldWithEvidence
} from "../services/storageService";

interface ComparatorSectionProps {
  onUploadClick?: () => void;
}

export default function ComparatorSection({ onUploadClick }: ComparatorSectionProps) {
  const [availableBanks, setAvailableBanks] = useState<StoredFile[]>([]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<BankComparisonResponse | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showCellModal, setShowCellModal] = useState(false);
  const [selectedCellData, setSelectedCellData] = useState<{
    bank: StoredFile;
    fieldName: string;
    fieldData: FieldWithEvidence;
    status: string;
    explanation: string;
    details?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load available banks on component mount
  useEffect(() => {
    const loadBanks = () => {
      const files = storageService.getStoredFiles();
      const successfulFiles = files.filter(file => 
        file.status === "success" && 
        file.bankInfo?.bank_name && 
        file.bankInfo?.is_valid_home_loan_mitc === true
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

  const callComparisonAPI = async (bankData: StoredFile[]) => {
    const request: BankComparisonRequest = {
      banks: bankData.map(bank => ({
        bank_id: bank.id,
        bank_info: bank.bankInfo!
      }))
    };

    const response = await fetch('http://localhost:8000/compare-banks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<BankComparisonResponse>;
  };

  const handleCompare = async () => {
    if (selectedBanks.length >= 2) {
      setIsComparing(true);
      setShowComparisonModal(false);
      setErrorMessage(null);
      
      try {
        const selectedBankData = availableBanks.filter(bank => 
          selectedBanks.includes(bank.id)
        );
        
        // Check if result is already cached
        const cachedResult = storageService.getCachedComparisonResult(selectedBanks);
        
        if (cachedResult) {
          console.log('Using cached comparison result for banks:', selectedBanks);
          setComparisonResult(cachedResult);
          setShowComparisonModal(true);
        } else {
          console.log('Making new API call for comparison of banks:', selectedBanks);
          const result = await callComparisonAPI(selectedBankData);
          
          // Cache the result for future use
          storageService.saveComparisonResult(selectedBanks, result);
          
          setComparisonResult(result);
          setShowComparisonModal(true);
        }
        
      } catch (error) {
        console.error('Comparison failed:', error);
        setErrorMessage('Something went wrong. Please try again after some time.');
      } finally {
        setIsComparing(false);
      }
    }
  };

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

  const fieldDisplayNames = {
    'fees_and_charges': 'Fees & Charges',
    'prepayment': 'Prepayment',
    'ltv_bands': 'LTV Bands',
    'eligibility': 'Eligibility',
    'tenure': 'Tenure',
    'interest_reset': 'Interest Reset',
    'documents_required': 'Documents Required'
  };

  const getFieldData = (bank: StoredFile, fieldName: string): FieldWithEvidence | null => {
    if (!bank.bankInfo) return null;
    
    switch (fieldName) {
      case 'fees_and_charges':
        return bank.bankInfo.fees_and_charges;
      case 'prepayment':
        return bank.bankInfo.prepayment;
      case 'ltv_bands':
        return bank.bankInfo.ltv_bands;
      case 'eligibility':
        return bank.bankInfo.eligibility;
      case 'tenure':
        return bank.bankInfo.tenure;
      case 'interest_reset':
        return bank.bankInfo.interest_reset;
      case 'documents_required':
        return bank.bankInfo.documents_required;
      default:
        return null;
    }
  };

  const handleCellClick = (bank: StoredFile, fieldName: string, cell: BankComparisonCell) => {
    const fieldData = getFieldData(bank, fieldName);
    if (fieldData) {
      setSelectedCellData({
        bank,
        fieldName,
        fieldData,
        status: cell.status,
        explanation: cell.explanation,
        details: cell.details
      });
      setShowCellModal(true);
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
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          {chartIcon}
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Banks Available</h2>
          <p className="text-gray-600">
            <button 
              onClick={onUploadClick}
              className="text-yellow-600 hover:text-yellow-700 underline underline-offset-2 font-medium transition-colors"
            >
              Upload
            </button>
            {' '}and process some bank policy documents first to compare them here.
          </p>
        </div>
      </div>
    );
  }


  return (
    <>
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
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto" style={{maxHeight: '160px'}}>
                  {availableBanks.map((bank) => (
                    <div
                      key={bank.id}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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
            disabled={selectedBanks.length < 2 || isComparing}
            className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedBanks.length >= 2 && !isComparing
                ? "bg-yellow-400 text-black hover:bg-yellow-500 shadow-md"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isComparing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-gray-600"></div>
                <span>Comparing...</span>
              </div>
            ) : selectedBanks.length < 2 ? (
              `Compare Banks (${selectedBanks.length}/2 minimum)`
            ) : (
              `Compare ${selectedBanks.length} Banks`
            )}
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="mt-2 text-red-600 text-xs underline hover:text-red-700"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Info Section */}
          <div className="text-center text-gray-600 mt-4">
            <p className="text-xs">
              Select at least 2 banks from the dropdown above to start comparing.
            </p>
          </div>
          </div>
        </div>
      </div>
      
      {/* Comparison Modal - Rendered at document body level to overlay entire screen */}
      {showComparisonModal && comparisonResult && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-20 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg w-[80vw] h-[80vh] flex flex-col shadow-2xl max-w-none max-h-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Bank Policy Comparison
                </h2>
                <p className="text-gray-600 text-sm">
                  Comparing {selectedBanks.length} banks: {availableBanks
                    .filter(bank => selectedBanks.includes(bank.id))
                    .map(b => b.bankInfo?.bank_name)
                    .join(', ')}
                </p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden p-6">
              {!showCellModal ? (
                /* Comparison Table */
                <div className="overflow-auto h-full border border-gray-300 rounded-lg">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr className="border-t border-gray-300">
                        <th className="border-r border-b border-gray-300 px-4 py-3 text-left font-medium text-gray-900 min-w-48 bg-gray-50">
                          Policy Field
                        </th>
                        {availableBanks
                          .filter(bank => selectedBanks.includes(bank.id))
                          .map((bank) => (
                            <th key={bank.id} className="border-r border-b border-gray-300 px-4 py-3 text-center font-medium text-gray-900 min-w-32 bg-gray-50">
                              {bank.bankInfo?.bank_name}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonResult.comparison_table.map((row) => (
                        <tr key={row.field_name} className="hover:bg-gray-50 group">
                          <td className="border border-gray-300 px-4 py-3 font-medium text-gray-900 bg-gray-50">
                            {fieldDisplayNames[row.field_name as keyof typeof fieldDisplayNames] || row.field_name}
                          </td>
                          {availableBanks
                            .filter(bank => selectedBanks.includes(bank.id))
                            .map((bank) => {
                              const cell = row.bank_results.find(result => result.bank_id === bank.id);
                              if (!cell) {
                                return (
                                  <td key={bank.id} className="border border-gray-300 px-4 py-3 text-center">
                                    <div className="text-gray-400 text-xs">No data</div>
                                  </td>
                                );
                              }
                              
                              return (
                                <td 
                                  key={bank.id} 
                                  className="border border-gray-300 px-4 py-3 text-center cursor-pointer hover:bg-blue-50 transition-colors group/cell"
                                  onClick={() => handleCellClick(bank, row.field_name, cell)}
                                  title="Click to view detailed information"
                                >
                                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cell.status)}`}>
                                    {cell.status}
                                  </div>
                                  {cell.explanation && (
                                    <div className="text-xs text-gray-600 mt-1" title={cell.details || cell.explanation}>
                                      {cell.explanation}
                                    </div>
                                  )}
                                  {/* Click indicator */}
                                  <div className="text-xs text-blue-600 mt-1 opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                    Click for details
                                  </div>
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Detail View */
                <ComparisonDetailModal
                  isOpen={showCellModal}
                  onClose={() => setShowCellModal(false)}
                  bank={selectedCellData?.bank || null}
                  fieldName={selectedCellData?.fieldName || ''}
                  fieldData={selectedCellData?.fieldData || null}
                  status={selectedCellData?.status || ''}
                  explanation={selectedCellData?.explanation || ''}
                  details={selectedCellData?.details}
                />
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
