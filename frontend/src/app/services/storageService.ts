interface BankInfo {
  bank_name: string;
  fees_and_charges: string;
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
}

export const storageService = new StorageService();
export type { StoredFile, BankInfo };
