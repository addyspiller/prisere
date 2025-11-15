"""
Legal disclaimer utilities for Prisere API.
"""


def get_legal_disclaimer() -> str:
    """
    Return the standard legal disclaimer for Prisere.
    
    This disclaimer clarifies:
    - What the tool does (automated detection and comparison)
    - What it doesn't do (no recommendations, advice, or external data)
    - User responsibility (consult licensed professionals)
    
    Returns:
        str: Legal disclaimer text
    """
    return (
        "This tool provides automated detection and comparison of changes between your insurance policies. "
        "It reports factual differences found in the documents you upload and offers general educational "
        "information about insurance terms. This tool does not evaluate coverage adequacy, make recommendations, "
        "or provide legal or financial advice. The system analyzes only the two policy documents you upload. "
        "No external data, prior records, or third-party sources are used in the analysis. Always consult with "
        "your licensed insurance broker or provider to understand how these changes affect your specific business needs."
    )


def get_disclaimer_dict() -> dict:
    """
    Return the legal disclaimer as a dictionary (for JSON responses).
    
    Returns:
        dict: Dictionary with 'disclaimer' key
    """
    return {
        "disclaimer": get_legal_disclaimer()
    }

