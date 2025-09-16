from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import asyncio
import time
import os
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv

from models import BankInfo, PDFProcessResult, ProcessPDFsResponse, BankComparisonRequest, BankComparisonResponse, ComparisonRow, ComparisonCell

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

router = APIRouter()

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

client = genai.Client(api_key=GEMINI_API_KEY)

# Retry mechanism with exponential backoff
async def process_pdf_with_retry(pdf_content: bytes, filename: str, max_retries: int = 3) -> PDFProcessResult:
    logger.info(f"Processing {filename} ({len(pdf_content)} bytes)")
    
    for attempt in range(max_retries):
        try:
            # Create the comprehensive prompt for structured output
            prompt = """
            Analyze this bank policy document and extract the following information with evidence.

            **CHAIN OF THOUGHT APPROACH:**
            For each field below, follow this reasoning:
            1. First, search thoroughly through the document for relevant information
            2. If you find relevant information: set missing=false, provide content and evidence
            3. If you don't find information: set missing=true, leave content and evidence as null/empty

            **FIELDS TO EXTRACT:**

            1. **Bank Name**: Extract the short form name (e.g., ICICI, HDFC, SBI, DBS, AXIS, etc.)
            
            2. **Fees and Charges**: All fees, charges, processing fees, administrative costs, penalties, etc.
            
            3. **Prepayment**: Terms for prepayment, prepayment penalties, conditions, minimum amounts, etc.
            
            4. **LTV Bands**: Loan to Value ratio bands, different LTV categories, associated rates or terms
            
            5. **Eligibility**: Eligibility criteria for loans, income requirements, employment criteria, etc.
            
            6. **Tenure**: Loan tenure options, minimum and maximum tenure, repayment periods
            
            7. **Interest Reset**: Interest rate reset frequency, floating rate terms, rate review periods
            
            8. **Documents Required**: List of required documents for loan application, KYC documents, etc.

            **RESPONSE FORMAT:**
            For each field:
            - **missing**: boolean (true if not found, false if found)
            - **content**: string (only if missing=false) - Brief explanation/summary of what was found
            - **evidence**: array (only if missing=false) - List of supporting evidence with page numbers and exact text snippets

            **LOGIC:**
            - If missing=true: content and evidence should be null/empty
            - If missing=false: content and evidence must be provided with actual findings
            """
            
            # Process PDF with Gemini using structured output
            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[
                    types.Part.from_bytes(
                        data=pdf_content,
                        mime_type='application/pdf',
                    ),
                    prompt
                ],
                config={
                    "response_mime_type": "application/json",
                    "response_schema": BankInfo,
                }
            )
            
            # Use the parsed response directly
            bank_info: BankInfo = response.parsed
            logger.info(f"✓ Extracted data for {bank_info.bank_name} from {filename}")
            
            return PDFProcessResult(
                filename=filename,
                status="success",
                bank_info=bank_info
            )
                
        except Exception as e:
            if attempt == max_retries - 1:
                # Last attempt failed
                logger.error(f"✗ Failed to process {filename}: {str(e)}")
                return PDFProcessResult(
                    filename=filename,
                    status="failed",
                    error_message=f"Failed after {max_retries} attempts: {str(e)}"
                )
            
            # Wait before retry with exponential backoff
            wait_time = (2 ** attempt) + (time.time() % 1)
            await asyncio.sleep(wait_time)
    
    return PDFProcessResult(
        filename=filename,
        status="failed",
        error_message="Max retries exceeded"
    )

@router.post("/process-pdfs", response_model=ProcessPDFsResponse)
async def process_pdfs(files: List[UploadFile] = File(...)):
    """
    Process multiple PDF files and extract comprehensive bank policy information.
    """
    logger.info(f"Starting batch processing of {len(files)} files")
    
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    results = []
    
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            results.append(PDFProcessResult(
                filename=file.filename,
                status="failed",
                error_message="File is not a PDF"
            ))
            continue
        
        try:
            # Read PDF content
            pdf_content = await file.read()
            
            # Process PDF with retry mechanism
            result = await process_pdf_with_retry(pdf_content, file.filename)
            results.append(result)
            
        except Exception as e:
            results.append(PDFProcessResult(
                filename=file.filename,
                status="failed",
                error_message=f"Error reading file: {str(e)}"
            ))
    
    # Calculate summary statistics
    successful = sum(1 for r in results if r.status == "success")
    failed = len(results) - successful
    
    return ProcessPDFsResponse(
        results=results,
        total_processed=len(results),
        successful=successful,
        failed=failed
    )


@router.post("/compare-banks", response_model=BankComparisonResponse)
async def compare_banks(request: BankComparisonRequest):
    """
    Compare multiple banks' policy information and return a detailed comparison table.
    """
    logger.info(f"Starting comparison of {len(request.banks)} banks")
    
    if len(request.banks) < 2:
        raise HTTPException(status_code=400, detail="At least 2 banks are required for comparison")
    
    try:
        # Prepare bank data for AI analysis (only content needed for comparison)
        banks_data = {}
        for bank_data in request.banks:
            banks_data[bank_data.bank_id] = {
                "bank_name": bank_data.bank_info.bank_name,
                "fees_and_charges": {
                    "missing": bank_data.bank_info.fees_and_charges.missing,
                    "content": bank_data.bank_info.fees_and_charges.content
                },
                "prepayment": {
                    "missing": bank_data.bank_info.prepayment.missing,
                    "content": bank_data.bank_info.prepayment.content
                },
                "ltv_bands": {
                    "missing": bank_data.bank_info.ltv_bands.missing,
                    "content": bank_data.bank_info.ltv_bands.content
                },
                "eligibility": {
                    "missing": bank_data.bank_info.eligibility.missing,
                    "content": bank_data.bank_info.eligibility.content
                },
                "tenure": {
                    "missing": bank_data.bank_info.tenure.missing,
                    "content": bank_data.bank_info.tenure.content
                },
                "interest_reset": {
                    "missing": bank_data.bank_info.interest_reset.missing,
                    "content": bank_data.bank_info.interest_reset.content
                },
                "documents_required": {
                    "missing": bank_data.bank_info.documents_required.missing,
                    "content": bank_data.bank_info.documents_required.content
                }
            }
        
        # Create comprehensive AI prompt for comparison
        bank_names = [bank_data.bank_info.bank_name for bank_data in request.banks]
        prompt = f"""
        Compare the following {len(request.banks)} banks' policy information and create a detailed comparison analysis:

        Banks to compare: {', '.join(bank_names)}

        **COMPARISON LOGIC:**
        For each field (fees_and_charges, prepayment, ltv_bands, eligibility, tenure, interest_reset, documents_required), 
        compare across all banks and assign one of these statuses:

        1. **SAME**: Information is semantically equivalent across banks (even if worded differently)
        2. **DIFF**: Information is clearly different between banks
        3. **MISSING**: Information is not available in this specific bank (missing=true)
        4. **SUSPECT**: Information contains issues like:
           - Conflicting information within the same bank's data
           - Overlapping/contradictory ranges or thresholds
           - Ambiguous language that could be interpreted multiple ways
           - Inconsistent units or formats
           - Incomplete conditions or missing qualifying criteria

        **BANK DATA:**
        {banks_data}

        **INSTRUCTIONS:**
        1. For each of the 7 fields, compare all banks
        2. For each bank-field combination, provide:
           - status: SAME/DIFF/MISSING/SUSPECT
           - explanation: Brief reason for the status
           - details: Additional context if needed (optional)
        
        3. Create a summary with counts of each status type across all comparisons

        **IMPORTANT:**
        - SUSPECT is critical - flag any contradictory, ambiguous, or incomplete information
        - SAME means semantically equivalent (not exact text match)
        - Compare based on the content field for each bank
        - If a field is missing in one bank (missing=true), that specific cell should be MISSING
        """
        
        logger.info("Sending comparison request to Gemini API")
        
        # Call Gemini AI for comparison analysis
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt],
            config={
                "response_mime_type": "application/json",
                "response_schema": BankComparisonResponse,
            }
        )
        
        # Parse the AI response
        comparison_result: BankComparisonResponse = response.parsed
        
        logger.info(f"✓ Successfully compared {len(request.banks)} banks")
        
        return comparison_result
        
    except Exception as e:
        logger.error(f"✗ Failed to compare banks: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")
