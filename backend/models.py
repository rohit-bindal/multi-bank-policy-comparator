from pydantic import BaseModel, Field
from typing import List, Optional, Dict


class Evidence(BaseModel):
    page_number: Optional[int] = Field(description="Page number where information was found")
    line_snippet: str = Field(description="Exact text snippet from the document")


class FieldWithEvidence(BaseModel):
    missing: bool = Field(description="True if information is not found in the document, False if found")
    content: Optional[str] = Field(default=None, description="Brief explanation/summary of the extracted information (only if not missing)")
    evidence: Optional[List[Evidence]] = Field(default=None, description="Supporting evidence with page numbers and line snippets (only if not missing)")


class BankInfo(BaseModel):
    bank_name: str = Field(description="Short form name of the bank (e.g., ICICI, HDFC, SBI, DBS)")
    is_valid_home_loan_mitc: bool = Field(description="True if this is a valid home loan MITC document, False otherwise")
    validation_reason: Optional[str] = Field(default=None, description="Reason why document is invalid (only if is_valid_home_loan_mitc is False)")
    fees_and_charges: FieldWithEvidence = Field(description="All fees and charges information with evidence")
    prepayment: FieldWithEvidence = Field(description="Prepayment terms and conditions with evidence")
    ltv_bands: FieldWithEvidence = Field(description="Loan to Value (LTV) ratio bands with evidence")
    eligibility: FieldWithEvidence = Field(description="Eligibility criteria with evidence")
    tenure: FieldWithEvidence = Field(description="Loan tenure information with evidence")
    interest_reset: FieldWithEvidence = Field(description="Interest reset frequency and terms with evidence")
    documents_required: FieldWithEvidence = Field(description="Required documents list with evidence")


class PDFProcessResult(BaseModel):
    filename: str
    status: str  # "success" or "failed"
    bank_info: Optional[BankInfo] = None
    error_message: Optional[str] = None


class ProcessPDFsResponse(BaseModel):
    results: List[PDFProcessResult]
    total_processed: int
    successful: int
    failed: int


# Comparison Models
class BankComparisonData(BaseModel):
    bank_id: str = Field(description="Unique identifier for the bank")
    bank_info: BankInfo = Field(description="Complete bank information with all fields")


class ComparisonCell(BaseModel):
    status: str = Field(description="Comparison status: SAME, DIFF, MISSING, or SUSPECT")
    explanation: str = Field(description="Brief explanation of why this status was assigned")
    details: Optional[str] = Field(default=None, description="Additional details if needed")


class BankComparisonCell(BaseModel):
    bank_id: str = Field(description="Unique identifier for the bank")
    bank_name: str = Field(description="Name of the bank")
    status: str = Field(description="Comparison status: SAME, DIFF, MISSING, or SUSPECT")
    explanation: str = Field(description="Brief explanation of why this status was assigned")
    details: Optional[str] = Field(default=None, description="Additional details if needed")


class ComparisonRow(BaseModel):
    field_name: str = Field(description="Name of the field being compared")
    bank_results: List[BankComparisonCell] = Field(description="Comparison results for each bank")


class SummaryCount(BaseModel):
    status: str = Field(description="Status type: SAME, DIFF, MISSING, or SUSPECT")
    count: int = Field(description="Number of occurrences of this status")


class BankComparisonRequest(BaseModel):
    banks: List[BankComparisonData] = Field(description="List of banks to compare", min_items=2)


class BankComparisonResponse(BaseModel):
    comparison_table: List[ComparisonRow] = Field(description="Comparison results organized by field")
    summary: List[SummaryCount] = Field(description="Summary counts of SAME/DIFF/MISSING/SUSPECT across all comparisons")
