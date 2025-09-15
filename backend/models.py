from pydantic import BaseModel, Field
from typing import List, Optional


class BankInfo(BaseModel):
    bank_name: str = Field(description="Name of the bank")
    fees_and_charges: str = Field(description="All fees and charges information as a string")


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
