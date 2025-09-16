interface Evidence {
  page_number?: number;
  line_snippet: string;
}

interface FieldWithEvidence {
  missing: boolean; // True if information not found in document
  content?: string; // Brief explanation/summary (only if not missing)
  evidence?: Evidence[]; // Page numbers and line snippets (only if not missing)
}

interface BankInfo {
  bank_name: string;
  is_valid_home_loan_mitc: boolean;
  validation_reason?: string;
  effective_date?: string;
  updated_date?: string;
  date_source?: "effective_date" | "updated_date" | "not_found";
  fees_and_charges: FieldWithEvidence;
  prepayment: FieldWithEvidence;
  ltv_bands: FieldWithEvidence;
  eligibility: FieldWithEvidence;
  tenure: FieldWithEvidence;
  interest_reset: FieldWithEvidence;
  documents_required: FieldWithEvidence;
}

interface StoredFile {
  id: string;
  filename: string;
  uploadDate: string;
  status: "success" | "failed" | "processing";
  bankInfo?: BankInfo;
  errorMessage?: string;
  fileSize: number;
}

class StorageService {
  private readonly STORAGE_KEY = "multi-bank-files";
  private readonly COMPARISON_CACHE_KEY = "multi-bank-comparisons";

  // Get all stored files
  getStoredFiles(): StoredFile[] {
    if (typeof window === "undefined") return [];
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return [];
    }
  }

  // Add a new file
  addFile(file: File): StoredFile {
    const newFile: StoredFile = {
      id: this.generateId(),
      filename: file.name,
      uploadDate: new Date().toISOString(),
      status: "processing",
      fileSize: file.size,
    };

    const files = this.getStoredFiles();
    files.unshift(newFile); // Add to beginning
    this.saveFiles(files);
    
    return newFile;
  }

  // Update file with processing results
  updateFileResult(id: string, result: { status: "success" | "failed"; bankInfo?: BankInfo; errorMessage?: string }) {
    const files = this.getStoredFiles();
    const fileIndex = files.findIndex(f => f.id === id);
    
    if (fileIndex !== -1) {
      files[fileIndex] = {
        ...files[fileIndex],
        status: result.status,
        bankInfo: result.bankInfo,
        errorMessage: result.errorMessage,
      };
      this.saveFiles(files);
    }
  }

  // Delete a file
  deleteFile(id: string) {
    const files = this.getStoredFiles();
    const updatedFiles = files.filter(f => f.id !== id);
    this.saveFiles(updatedFiles);
  }

  // Get file by ID
  getFileById(id: string): StoredFile | undefined {
    return this.getStoredFiles().find(f => f.id === id);
  }

  // Clear all files
  clearAllFiles() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private saveFiles(files: StoredFile[]) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Comparison Caching Methods
  private generateComparisonKey(bankIds: string[]): string {
    // Sort bank IDs to ensure consistent key regardless of selection order
    return bankIds.sort().join('-');
  }

  // Save comparison result to cache
  saveComparisonResult(bankIds: string[], result: BankComparisonResponse): void {
    if (typeof window === "undefined") return;
    
    try {
      const cacheKey = this.generateComparisonKey(bankIds);
      const cached = this.getComparisonCache();
      
      // Add timestamp for potential expiration in the future
      cached[cacheKey] = {
        result,
        timestamp: Date.now(),
        bankIds: bankIds.sort()
      };
      
      localStorage.setItem(this.COMPARISON_CACHE_KEY, JSON.stringify(cached));
    } catch (error) {
      console.error("Error saving comparison result to cache:", error);
    }
  }

  // Get comparison result from cache
  getCachedComparisonResult(bankIds: string[]): BankComparisonResponse | null {
    if (typeof window === "undefined") return null;
    
    try {
      const cacheKey = this.generateComparisonKey(bankIds);
      const cached = this.getComparisonCache();
      
      if (cached[cacheKey]) {
        return cached[cacheKey].result;
      }
      
      return null;
    } catch (error) {
      console.error("Error reading comparison result from cache:", error);
      return null;
    }
  }

  // Get all cached comparisons
  private getComparisonCache(): Record<string, {
    result: BankComparisonResponse;
    timestamp: number;
    bankIds: string[];
  }> {
    if (typeof window === "undefined") return {};
    
    try {
      const cached = localStorage.getItem(this.COMPARISON_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error("Error reading comparison cache:", error);
      return {};
    }
  }

  // Clear comparison cache
  clearComparisonCache(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.COMPARISON_CACHE_KEY);
    }
  }

  // Check if comparison result is cached
  isComparisonCached(bankIds: string[]): boolean {
    const cacheKey = this.generateComparisonKey(bankIds);
    const cached = this.getComparisonCache();
    return !!cached[cacheKey];
  }

  // Get all cached comparison keys (for debugging/management)
  getCachedComparisonKeys(): string[] {
    const cached = this.getComparisonCache();
    return Object.keys(cached);
  }
}

// Comparison interfaces
interface BankComparisonData {
  bank_id: string;
  bank_info: BankInfo;
}

interface BankComparisonCell {
  bank_id: string;
  bank_name: string;
  status: 'SAME' | 'DIFF' | 'MISSING' | 'SUSPECT';
  explanation: string;
  details?: string;
}

interface ComparisonRow {
  field_name: string;
  bank_results: BankComparisonCell[];
}

interface SummaryCount {
  status: string;
  count: number;
}

interface BankComparisonRequest {
  banks: BankComparisonData[];
}

interface BankComparisonResponse {
  comparison_table: ComparisonRow[];
  summary: SummaryCount[];
}

export const storageService = new StorageService();
export type { 
  StoredFile, 
  BankInfo, 
  FieldWithEvidence, 
  Evidence,
  BankComparisonData,
  BankComparisonCell,
  ComparisonRow,
  SummaryCount,
  BankComparisonRequest,
  BankComparisonResponse
};
