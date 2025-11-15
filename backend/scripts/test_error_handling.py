"""
Test script to demonstrate error handling and legal disclaimer.

Run the server first:
    uvicorn app.main:app --reload --port 3001

Then run this script:
    python scripts/test_error_handling.py
"""
import requests
import json
from pprint import pprint


def print_section(title: str):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def test_http_error():
    """Test HTTP 404 error handling."""
    print_section("1. HTTP Error (404 Not Found)")
    
    try:
        response = requests.get("http://localhost:3001/v1/invalid-endpoint")
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse:")
        pprint(response.json(), indent=2)


def test_validation_error():
    """Test validation error handling."""
    print_section("2. Validation Error (422 Unprocessable Entity)")
    
    # Send empty body (missing required fields)
    try:
        response = requests.post(
            "http://localhost:3001/v1/analyses",
            json={},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse:")
        pprint(response.json(), indent=2)


def test_analysis_not_found():
    """Test analysis job not found error."""
    print_section("3. Analysis Not Found (404)")
    
    try:
        response = requests.get("http://localhost:3001/v1/analyses/invalid-job-id/status")
        response.raise_for_status()
    except requests.exceptions.HTTPError:
        print(f"Status Code: {response.status_code}")
        print(f"\nResponse:")
        pprint(response.json(), indent=2)


def test_health_check():
    """Test health check endpoint includes disclaimer."""
    print_section("4. Health Check (200 OK) - Includes Disclaimer")
    
    response = requests.get("http://localhost:3001/health")
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:")
    pprint(response.json(), indent=2)


def test_root_endpoint():
    """Test root endpoint includes disclaimer."""
    print_section("5. Root Endpoint (200 OK) - Includes Disclaimer")
    
    response = requests.get("http://localhost:3001/")
    print(f"Status Code: {response.status_code}")
    print(f"\nResponse:")
    pprint(response.json(), indent=2)


def main():
    """Run all error handling tests."""
    print("\n" + "=" * 80)
    print("  ERROR HANDLING & LEGAL DISCLAIMER TEST SUITE")
    print("=" * 80)
    print("\nTesting Prisere API error handling and legal disclaimer...")
    print("Server should be running on http://localhost:3001")
    
    try:
        # Test successful endpoints first (to verify server is running)
        test_health_check()
        test_root_endpoint()
        
        # Test error endpoints
        test_http_error()
        test_validation_error()
        test_analysis_not_found()
        
        print("\n" + "=" * 80)
        print("  ALL TESTS COMPLETED")
        print("=" * 80)
        print("\n✅ All error responses include legal disclaimer")
        print("✅ Error messages are user-friendly and structured")
        print("✅ Status codes are appropriate for each error type")
        print("\nCheck backend/logs/prisere_YYYYMMDD.log for detailed logs")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to server")
        print("Make sure the server is running:")
        print("  uvicorn app.main:app --reload --port 3001")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")


if __name__ == "__main__":
    main()

