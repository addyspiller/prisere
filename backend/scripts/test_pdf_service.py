#!/usr/bin/env python
"""
Test PDF service functionality.
"""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.services.pdf_service import pdf_service


def test_pdf_extraction():
    """Test PDF text extraction and metadata."""
    print("=" * 60)
    print("PDF Service Test")
    print("=" * 60)
    print()
    
    # Test file path
    test_pdf = Path("tests/test_files/prisere_upload_test.pdf")
    
    if not test_pdf.exists():
        print(f"❌ Test file not found: {test_pdf}")
        return False
    
    print(f"Test file: {test_pdf}")
    print()
    
    try:
        # Read PDF file
        with open(test_pdf, "rb") as f:
            pdf_bytes = f.read()
        
        print(f"File size: {len(pdf_bytes):,} bytes")
        print()
        
        # Test 1: Validate PDF
        print("Test 1: Validating PDF...")
        is_valid = pdf_service.validate_pdf(pdf_bytes)
        if is_valid:
            print("✅ PDF is valid")
        else:
            print("❌ PDF is invalid")
            return False
        print()
        
        # Test 2: Extract metadata
        print("Test 2: Extracting metadata...")
        metadata = pdf_service.get_pdf_metadata(pdf_bytes)
        print("✅ Metadata extracted:")
        print(f"  - Page count: {metadata.get('page_count')}")
        print(f"  - Is encrypted: {metadata.get('is_encrypted')}")
        print(f"  - Title: {metadata.get('title', 'N/A')}")
        print(f"  - Author: {metadata.get('author', 'N/A')}")
        print()
        
        # Test 3: Extract text
        print("Test 3: Extracting text...")
        text = pdf_service.extract_text_from_bytes(pdf_bytes)
        print("✅ Text extracted:")
        print(f"  - Total characters: {len(text):,}")
        print(f"  - First 200 characters:")
        print(f"    {text[:200]}...")
        print()
        
        # Test 4: Extract text with metadata
        print("Test 4: Extracting text with metadata...")
        result = pdf_service.extract_text_with_metadata(pdf_bytes)
        print("✅ Text and metadata extracted:")
        print(f"  - Text length: {len(result['text']):,}")
        print(f"  - Pages: {result['metadata']['page_count']}")
        print()
        
        print("=" * 60)
        print("✅ All PDF tests passed!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_pdf_extraction()
    sys.exit(0 if success else 1)

