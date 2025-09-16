// Field configuration for frontend
export interface FieldConfig {
  [key: string]: {
    display_name: string;
    description: string;
    synonyms: string[];
  };
}

// Default field configuration - matches backend
export const DEFAULT_FIELD_CONFIG: FieldConfig = {
  fees_and_charges: {
    display_name: "Fees & Charges",
    description: "All fees, charges, processing fees, administrative costs, penalties, etc.",
    synonyms: ["fees", "charges", "processing fee", "administrative costs", "penalties"]
  },
  prepayment: {
    display_name: "Prepayment", 
    description: "Terms for prepayment, prepayment penalties, conditions, minimum amounts, etc.",
    synonyms: ["prepayment", "foreclosure", "pre-closure", "early closure", "part payment"]
  },
  ltv_bands: {
    display_name: "LTV Bands",
    description: "Loan to Value ratio bands, different LTV categories, associated rates or terms", 
    synonyms: ["ltv", "loan to value", "ltv ratio", "ltv bands"]
  },
  eligibility: {
    display_name: "Eligibility",
    description: "Eligibility criteria for loans, income requirements, employment criteria, etc.",
    synonyms: ["eligibility", "eligible", "qualification", "criteria", "requirements"]
  },
  tenure: {
    display_name: "Tenure",
    description: "Loan tenure options, minimum and maximum tenure, repayment periods",
    synonyms: ["tenure", "term", "loan period", "repayment period", "duration"]
  },
  interest_reset: {
    display_name: "Interest Reset",
    description: "Interest rate reset frequency, floating rate terms, rate review periods",
    synonyms: ["interest reset", "rate review", "floating rate", "rate revision"]
  },
  documents_required: {
    display_name: "Documents Required",
    description: "Required documents for loan application, KYC documents, etc.",
    synonyms: ["documents", "documentation", "kyc", "papers", "required documents"]
  }
};

// Get field configuration (can be extended to load from API/env in future)
export function getFieldConfig(): FieldConfig {
  // For now, return default config
  // Future: Could load from environment variable or API
  return DEFAULT_FIELD_CONFIG;
}

// Get field display names mapping
export function getFieldDisplayNames(): Record<string, string> {
  const config = getFieldConfig();
  const displayNames: Record<string, string> = {};
  
  for (const [key, field] of Object.entries(config)) {
    displayNames[key] = field.display_name;
  }
  
  return displayNames;
}

// Get field keys
export function getFieldKeys(): string[] {
  return Object.keys(getFieldConfig());
}
