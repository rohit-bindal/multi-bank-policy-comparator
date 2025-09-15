from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import asyncio
import time
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

from models import BankInfo, PDFProcessResult, ProcessPDFsResponse

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
    for attempt in range(max_retries):
        try:
            # Create the prompt for structured output
            prompt = "Analyze this bank policy document and extract the bank name and all fees and charges information as a comprehensive string."
            
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
            
            return PDFProcessResult(
                filename=filename,
                status="success",
                bank_info=bank_info
            )
                
        except Exception as e:
            if attempt == max_retries - 1:
                # Last attempt failed
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
    Process multiple PDF files and extract bank name and fees/charges information.
    """
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
