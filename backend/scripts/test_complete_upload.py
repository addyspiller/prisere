#!/usr/bin/env python
"""
Complete S3 Upload Flow Test Script

This script tests the full upload flow:
1. Initialize upload via backend API
2. Upload PDF directly to S3 using presigned URL
3. Verify upload via backend API

Usage:
    python scripts/test_complete_upload.py

Requirements:
    - Backend server running at http://localhost:3001
    - Test PDF file at tests/test_files/prisere_upload_test.pdf
    - Python requests library: pip install requests
"""

import sys
import os
import json
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import requests
from app.config import settings


# Configuration
BACKEND_URL = f"http://localhost:{settings.port}"
TEST_PDF_PATH = Path("tests/test_files/prisere_upload_test.pdf")


def print_section(title):
    """Print a formatted section header."""
    print()
    print("=" * 70)
    print(f"  {title}")
    print("=" * 70)


def print_success(message):
    """Print a success message."""
    print(f"✅ {message}")


def print_error(message):
    """Print an error message."""
    print(f"❌ {message}")


def print_info(message):
    """Print an info message."""
    print(f"ℹ️  {message}")


def step1_initialize_upload():
    """
    Step 1: Initialize upload via backend API.
    
    This calls POST /v1/uploads/init to get:
    - upload_url: S3 presigned POST URL
    - fields: All required form fields for S3 upload
    - s3_key: The S3 object key where file will be stored
    
    Returns:
        dict: Response JSON containing upload_url, fields, s3_key, etc.
        None: If initialization fails
    """
    print_section("Step 1: Initialize Upload via Backend")
    
    try:
        # Verify test file exists
        if not TEST_PDF_PATH.exists():
            print_error(f"Test PDF not found: {TEST_PDF_PATH}")
            print_info("Please ensure the test file exists before running this script")
            return None
        
        file_size = TEST_PDF_PATH.stat().st_size
        print_info(f"Test file: {TEST_PDF_PATH}")
        print_info(f"File size: {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")
        
        # Prepare request payload
        payload = {
            "file_type": "application/pdf",
            "filename": TEST_PDF_PATH.name
        }
        
        print_info(f"Calling: POST {BACKEND_URL}/v1/uploads/init")
        print_info(f"Payload: {json.dumps(payload, indent=2)}")
        
        # Call backend API
        response = requests.post(
            f"{BACKEND_URL}/v1/uploads/init",
            json=payload,
            timeout=10
        )
        
        # Check response
        print_info(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            print_error(f"Failed to initialize upload")
            print_error(f"Response: {response.text}")
            return None
        
        # Parse response
        init_data = response.json()
        
        print_success("Upload initialized successfully!")
        print()
        print("Response data:")
        print(f"  - upload_url: {init_data['upload_url']}")
        print(f"  - s3_key: {init_data['s3_key']}")
        print(f"  - expires_at: {init_data['expires_at']}")
        print(f"  - max_file_size_mb: {init_data['max_file_size_mb']}")
        print(f"  - fields count: {len(init_data['fields'])}")
        print()
        print("Required S3 fields:")
        for key in init_data['fields'].keys():
            print(f"  - {key}")
        
        return init_data
        
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend server")
        print_info(f"Make sure backend is running: python -m app.main")
        return None
    except requests.exceptions.Timeout:
        print_error("Request timeout")
        return None
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return None


def step2_upload_to_s3(init_data):
    """
    Step 2: Upload PDF directly to S3 using presigned URL.
    
    This constructs a multipart/form-data POST request with:
    - All fields from init_data['fields']
    - The PDF file (must be added LAST)
    
    Args:
        init_data (dict): Response from step 1 containing upload_url and fields
        
    Returns:
        bool: True if upload successful, False otherwise
    """
    print_section("Step 2: Upload PDF Directly to S3")
    
    try:
        # Read PDF file
        print_info(f"Reading PDF file: {TEST_PDF_PATH}")
        with open(TEST_PDF_PATH, 'rb') as f:
            file_content = f.read()
        
        print_success(f"Read {len(file_content):,} bytes from file")
        
        # Prepare form data
        # Important: All fields from 'fields' must be included
        # The file field must be added LAST
        
        print_info("Preparing multipart/form-data...")
        
        # Create form data dictionary (all fields except file)
        form_data = {}
        for key, value in init_data['fields'].items():
            form_data[key] = value
            print(f"  - Adding field: {key}")
        
        # Prepare file for upload
        # Format: {'field_name': (filename, file_content, content_type)}
        files = {
            'file': (TEST_PDF_PATH.name, file_content, 'application/pdf')
        }
        print_info("  - Adding file field (last)")
        
        # Upload to S3
        upload_url = init_data['upload_url']
        print()
        print_info(f"Uploading to S3: {upload_url}")
        print_info("This uploads DIRECTLY to S3, not through the backend")
        
        response = requests.post(
            upload_url,
            data=form_data,  # All S3 fields
            files=files,     # File content
            timeout=60       # Allow time for upload
        )
        
        # Check response
        print()
        print_info(f"S3 Response status: {response.status_code}")
        
        # S3 returns 204 No Content or 200 OK on success
        if response.status_code in [200, 204]:
            print_success("File uploaded successfully to S3!")
            return True
        else:
            print_error(f"Upload failed with status {response.status_code}")
            print_error(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print_error(f"Upload error: {e}")
        return False


def step3_verify_upload(init_data):
    """
    Step 3: Verify upload via backend API.
    
    This calls GET /v1/uploads/verify/{s3_key} to confirm:
    - File exists in S3
    - File metadata (size, content_type, etc.)
    
    Args:
        init_data (dict): Response from step 1 containing s3_key
        
    Returns:
        dict: Verification response data
        None: If verification fails
    """
    print_section("Step 3: Verify Upload via Backend")
    
    try:
        # Get S3 key and encode it properly for URL
        s3_key = init_data['s3_key']
        print_info(f"S3 Key: {s3_key}")
        
        # URL encode the S3 key (handles special characters like /)
        # Using quote with safe='' to encode everything except alphanumeric
        import urllib.parse
        s3_key_encoded = urllib.parse.quote(s3_key, safe='')
        
        print_info(f"Encoded S3 Key: {s3_key_encoded}")
        
        # Call verify endpoint
        verify_url = f"{BACKEND_URL}/v1/uploads/verify/{s3_key_encoded}"
        print_info(f"Calling: GET {verify_url}")
        
        response = requests.get(verify_url, timeout=10)
        
        print_info(f"Response status: {response.status_code}")
        
        if response.status_code != 200:
            print_error("Verification failed")
            print_error(f"Response: {response.text}")
            return None
        
        # Parse response
        verify_data = response.json()
        
        print_success("Upload verified successfully!")
        print()
        print("Verification data:")
        print(f"  - exists: {verify_data['exists']}")
        print(f"  - s3_key: {verify_data['s3_key']}")
        
        if verify_data.get('metadata'):
            metadata = verify_data['metadata']
            print()
            print("File metadata:")
            print(f"  - size: {metadata.get('size', 'N/A'):,} bytes")
            size_mb = metadata.get('size', 0) / 1024 / 1024
            print(f"  - size: {size_mb:.2f} MB")
            print(f"  - content_type: {metadata.get('content_type', 'N/A')}")
            print(f"  - last_modified: {metadata.get('last_modified', 'N/A')}")
            print(f"  - etag: {metadata.get('etag', 'N/A')}")
        
        return verify_data
        
    except Exception as e:
        print_error(f"Verification error: {e}")
        return None


def check_backend_connection():
    """
    Check if backend server is running and accessible.
    
    Returns:
        bool: True if backend is accessible, False otherwise
    """
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False


def main():
    """Main test execution."""
    print()
    print("=" * 70)
    print("  S3 PRESIGNED URL UPLOAD TEST")
    print("=" * 70)
    print()
    print("This script tests the complete upload flow:")
    print("  1. Initialize upload (backend generates presigned URL)")
    print("  2. Upload PDF directly to S3")
    print("  3. Verify upload (backend confirms file exists)")
    print()
    
    # Check backend connection
    print_info("Checking backend connection...")
    if not check_backend_connection():
        print_error("Backend server is not running or not accessible")
        print_info(f"Expected URL: {BACKEND_URL}")
        print_info("Start backend: python -m app.main")
        sys.exit(1)
    
    print_success(f"Backend is running at {BACKEND_URL}")
    
    # Step 1: Initialize upload
    init_data = step1_initialize_upload()
    if not init_data:
        print_error("Failed at Step 1 - Cannot continue")
        sys.exit(1)
    
    # Step 2: Upload to S3
    upload_success = step2_upload_to_s3(init_data)
    if not upload_success:
        print_error("Failed at Step 2 - Cannot continue")
        sys.exit(1)
    
    # Step 3: Verify upload
    verify_data = step3_verify_upload(init_data)
    if not verify_data:
        print_error("Failed at Step 3 - Upload may not have succeeded")
        sys.exit(1)
    
    # Summary
    print_section("Test Summary")
    print_success("All tests passed!")
    print()
    print("File successfully uploaded to S3:")
    print(f"  Bucket: {settings.aws_s3_bucket_name}")
    print(f"  Key: {init_data['s3_key']}")
    print(f"  Size: {verify_data['metadata']['size']:,} bytes")
    print()
    print("You can view this file in the AWS S3 Console:")
    print(f"  1. Go to: https://s3.console.aws.amazon.com/")
    print(f"  2. Navigate to bucket: {settings.aws_s3_bucket_name}")
    print(f"  3. Look for key: {init_data['s3_key']}")
    print()
    print_success("Test completed successfully! 🎉")
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print()
        print_info("Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print()
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

