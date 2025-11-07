#!/usr/bin/env python
"""
Test authentication setup by making a request to the verify endpoint.
Note: Requires a valid Clerk JWT token.
"""
import sys
import os
import requests

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.config import settings


def test_auth_with_token(token: str):
    """Test authentication endpoints with a JWT token."""
    base_url = f"http://localhost:{settings.port}"
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Testing authentication endpoints...")
    print(f"Base URL: {base_url}")
    print()
    
    # Test verify endpoint
    print("1. Testing /v1/auth/verify...")
    try:
        response = requests.get(f"{base_url}/v1/auth/verify", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        print()
    except Exception as e:
        print(f"   Error: {e}")
        print()
    
    # Test /me endpoint
    print("2. Testing /v1/auth/me...")
    try:
        response = requests.get(f"{base_url}/v1/auth/me", headers=headers)
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}")
        print()
    except Exception as e:
        print(f"   Error: {e}")
        print()


def test_health():
    """Test health endpoint (no auth required)."""
    base_url = f"http://localhost:{settings.port}"
    
    print("Testing health endpoint (no auth)...")
    try:
        response = requests.get(f"{base_url}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure the server is running: python -m app.main")
        return False


def main():
    print("=" * 60)
    print("Authentication Test Script")
    print("=" * 60)
    print()
    
    # Test health first
    if not test_health():
        sys.exit(1)
    
    # Check if token provided
    if len(sys.argv) < 2:
        print("To test authenticated endpoints, provide a JWT token:")
        print(f"python {sys.argv[0]} <your-jwt-token>")
        print()
        print("You can get a token by:")
        print("1. Login to your frontend app")
        print("2. Open browser console")
        print("3. Run: await window.Clerk.session.getToken()")
        print()
        sys.exit(0)
    
    token = sys.argv[1]
    test_auth_with_token(token)


if __name__ == "__main__":
    main()

