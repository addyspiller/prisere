#!/usr/bin/env python
"""
Test S3 service functionality.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.services.s3_service import s3_service
from app.config import settings


def test_s3_connection():
    """Test S3 connection and bucket access."""
    print("=" * 60)
    print("S3 Service Test")
    print("=" * 60)
    print()
    
    print(f"Bucket: {settings.aws_s3_bucket_name}")
    print(f"Region: {settings.aws_region}")
    print()
    
    try:
        # Test generating S3 key
        print("1. Testing S3 key generation...")
        s3_key = s3_service.generate_s3_key(
            user_id="test_user_123",
            filename="test-policy.pdf"
        )
        print(f"   Generated key: {s3_key}")
        print()
        
        # Test presigned upload URL
        print("2. Testing presigned upload URL generation...")
        upload_data = s3_service.generate_presigned_upload_url(
            s3_key=s3_key,
            content_type="application/pdf"
        )
        print(f"   Upload URL: {upload_data['url'][:80]}...")
        print(f"   S3 Key: {upload_data['key']}")
        print(f"   Expires at: {upload_data['expires_at']}")
        print()
        
        # Test presigned download URL
        print("3. Testing presigned download URL generation...")
        download_url = s3_service.generate_presigned_download_url(s3_key)
        print(f"   Download URL: {download_url[:80]}...")
        print()
        
        # Test file existence check
        print("4. Testing file existence check...")
        exists = s3_service.file_exists(s3_key)
        print(f"   File exists: {exists}")
        print()
        
        print("✅ All S3 tests passed!")
        print()
        print("Note: These tests only verify URL generation.")
        print("To test actual uploads, use the upload endpoints.")
        
    except Exception as e:
        print(f"❌ S3 test failed: {e}")
        print()
        print("Check your .env file:")
        print("- AWS_ACCESS_KEY_ID")
        print("- AWS_SECRET_ACCESS_KEY")
        print("- AWS_S3_BUCKET_NAME")
        print("- AWS_REGION")
        sys.exit(1)


if __name__ == "__main__":
    test_s3_connection()

