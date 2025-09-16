import os
from typing import Dict, List

# Default field configuration
DEFAULT_FIELDS = {
    "fees_and_charges": {
        "display_name": "Fees & Charges",
        "description": "All fees, charges, processing fees, administrative costs, penalties, etc.",
        "synonyms": ["fees", "charges", "processing fee", "administrative costs", "penalties"]
    },
    "prepayment": {
        "display_name": "Prepayment",
        "description": "Terms for prepayment, prepayment penalties, conditions, minimum amounts, etc.",
        "synonyms": ["prepayment", "foreclosure", "pre-closure", "early closure", "part payment"]
    },
    "ltv_bands": {
        "display_name": "LTV Bands",
        "description": "Loan to Value ratio bands, different LTV categories, associated rates or terms",
        "synonyms": ["ltv", "loan to value", "ltv ratio", "ltv bands"]
    },
    "eligibility": {
        "display_name": "Eligibility",
        "description": "Eligibility criteria for loans, income requirements, employment criteria, etc.",
        "synonyms": ["eligibility", "eligible", "qualification", "criteria", "requirements"]
    },
    "tenure": {
        "display_name": "Tenure",
        "description": "Loan tenure options, minimum and maximum tenure, repayment periods",
        "synonyms": ["tenure", "term", "loan period", "repayment period", "duration"]
    },
    "interest_reset": {
        "display_name": "Interest Reset",
        "description": "Interest rate reset frequency, floating rate terms, rate review periods",
        "synonyms": ["interest reset", "rate review", "floating rate", "rate revision"]
    },
    "documents_required": {
        "display_name": "Documents Required",
        "description": "Required documents for loan application, KYC documents, etc.",
        "synonyms": ["documents", "documentation", "kyc", "papers", "required documents"]
    }
}

def get_field_config() -> Dict:
    """Get field configuration from environment or use defaults"""
    config_file = os.getenv("FIELD_CONFIG_FILE")
    
    if config_file and os.path.exists(config_file):
        try:
            import json
            with open(config_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Warning: Could not load field config from {config_file}: {e}")
            print("Using default field configuration")
    
    return DEFAULT_FIELDS

def get_field_keys() -> List[str]:
    """Get list of field keys"""
    return list(get_field_config().keys())

def get_field_display_names() -> Dict[str, str]:
    """Get mapping of field keys to display names"""
    config = get_field_config()
    return {key: field["display_name"] for key, field in config.items()}

def get_field_descriptions() -> Dict[str, str]:
    """Get mapping of field keys to descriptions"""
    config = get_field_config()
    return {key: field["description"] for key, field in config.items()}
