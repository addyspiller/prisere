# S3 Upload Guide

## Overview

The backend uses AWS S3 for secure file storage with presigned URLs. This allows clients to upload files directly to S3 without routing data through the backend server.

## Architecture

```
┌─────────┐                  ┌─────────┐                  ┌─────┐
│ Client  │                  │ Backend │                  │ S3  │
└────┬────┘                  └────┬────┘                  └──┬──┘
     │                            │                          │
     │ 1. POST /uploads/init      │                          │
     ├───────────────────────────►│                          │
     │                            │                          │
     │ 2. Presigned URL + fields  │                          │
     │◄───────────────────────────┤                          │
     │                            │                          │
     │ 3. POST file to S3         │                          │
     ├────────────────────────────┼─────────────────────────►│
     │                            │                          │
     │ 4. Upload success          │                          │
     │◄────────────────────────────┼──────────────────────────┤
     │                            │                          │
     │ 5. GET /uploads/verify     │                          │
     ├───────────────────────────►│                          │
     │                            │                          │
     │                            │ 6. Check file exists     │
     │                            ├─────────────────────────►│
     │                            │                          │
     │                            │ 7. File metadata         │
     │                            │◄─────────────────────────┤
     │                            │                          │
     │ 8. Verification response   │                          │
     │◄───────────────────────────┤                          │
     │                            │                          │
```

---

## API Endpoints

### 1. Initialize Upload

**Endpoint:** `POST /v1/uploads/init`

Generate presigned S3 upload URL.

**Request:**
```json
{
  "file_type": "application/pdf",
  "filename": "current-policy.pdf"
}
```

**Response (200 OK):**
```json
{
  "upload_url": "https://s3.amazonaws.com/bucket-name",
  "fields": {
    "key": "uploads/user_123/uuid.pdf",
    "Content-Type": "application/pdf",
    "policy": "base64-encoded-policy",
    "x-amz-algorithm": "AWS4-HMAC-SHA256",
    "x-amz-credential": "...",
    "x-amz-date": "...",
    "x-amz-signature": "..."
  },
  "s3_key": "uploads/user_123/uuid.pdf",
  "expires_at": "2024-01-15T11:30:00Z",
  "max_file_size_mb": 25
}
```

**Validation:**
- Only `application/pdf` file type accepted
- Filename must end with `.pdf`
- Filename length: 1-255 characters

---

### 2. Verify Upload

**Endpoint:** `GET /v1/uploads/verify/{s3_key}`

Verify file was successfully uploaded to S3.

**Example:** `GET /v1/uploads/verify/uploads/user_123/uuid.pdf`

**Response (200 OK):**
```json
{
  "exists": true,
  "s3_key": "uploads/user_123/uuid.pdf",
  "metadata": {
    "size": 2048576,
    "content_type": "application/pdf",
    "last_modified": "2024-01-15T10:30:00Z",
    "etag": "abc123..."
  }
}
```

**Response (404 Not Found):**
```json
{
  "detail": "File not found: uploads/user_123/uuid.pdf"
}
```

---

### 3. Delete Upload

**Endpoint:** `DELETE /v1/uploads/{s3_key}`

Delete file from S3.

**Example:** `DELETE /v1/uploads/uploads/user_123/uuid.pdf`

**Response:** `204 No Content`

---

## Client Implementation

### Using Fetch API

```javascript
// Step 1: Initialize upload
async function initializeUpload(filename) {
  const response = await fetch('http://localhost:3001/v1/uploads/init', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_type: 'application/pdf',
      filename: filename
    })
  });
  
  return await response.json();
}

// Step 2: Upload file to S3
async function uploadToS3(file, uploadData) {
  const formData = new FormData();
  
  // Add all fields from presigned URL
  Object.entries(uploadData.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Add file last
  formData.append('file', file);
  
  const response = await fetch(uploadData.upload_url, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  return response;
}

// Step 3: Verify upload
async function verifyUpload(s3Key) {
  const response = await fetch(
    `http://localhost:3001/v1/uploads/verify/${encodeURIComponent(s3Key)}`
  );
  
  return await response.json();
}

// Complete flow
async function uploadFile(file) {
  try {
    // Initialize
    console.log('Initializing upload...');
    const uploadData = await initializeUpload(file.name);
    
    // Upload to S3
    console.log('Uploading to S3...');
    await uploadToS3(file, uploadData);
    
    // Verify
    console.log('Verifying upload...');
    const verification = await verifyUpload(uploadData.s3_key);
    
    console.log('Upload successful!', verification);
    return uploadData.s3_key;
    
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

// Usage
const fileInput = document.getElementById('file-input');
const file = fileInput.files[0];
const s3Key = await uploadFile(file);
```

---

### Using Axios

```javascript
import axios from 'axios';

async function uploadFile(file) {
  // Step 1: Initialize
  const { data: uploadData } = await axios.post(
    'http://localhost:3001/v1/uploads/init',
    {
      file_type: 'application/pdf',
      filename: file.name
    }
  );
  
  // Step 2: Upload to S3
  const formData = new FormData();
  Object.entries(uploadData.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append('file', file);
  
  await axios.post(uploadData.upload_url, formData);
  
  // Step 3: Verify
  const { data: verification } = await axios.get(
    `http://localhost:3001/v1/uploads/verify/${encodeURIComponent(uploadData.s3_key)}`
  );
  
  return uploadData.s3_key;
}
```

---

## S3 Service Methods

### `generate_s3_key(user_id, filename, prefix)`
Generate unique S3 key for file storage.

```python
s3_key = s3_service.generate_s3_key(
    user_id="user_123",
    filename="policy.pdf",
    prefix="uploads"
)
# Returns: "uploads/user_123/uuid-here.pdf"
```

---

### `generate_presigned_upload_url(s3_key, content_type, expiration)`
Generate presigned POST URL for uploading.

```python
upload_data = s3_service.generate_presigned_upload_url(
    s3_key="uploads/user_123/uuid.pdf",
    content_type="application/pdf",
    expiration=3600  # 1 hour
)
# Returns: {url, fields, key, expires_at}
```

---

### `generate_presigned_download_url(s3_key, expiration)`
Generate presigned GET URL for downloading.

```python
download_url = s3_service.generate_presigned_download_url(
    s3_key="uploads/user_123/uuid.pdf",
    expiration=3600
)
# Returns: "https://s3.amazonaws.com/..."
```

---

### `download_file_content(s3_key)`
Download file content as bytes.

```python
content = s3_service.download_file_content(
    s3_key="uploads/user_123/uuid.pdf"
)
# Returns: bytes
```

---

### `delete_file(s3_key)`
Delete single file.

```python
s3_service.delete_file("uploads/user_123/uuid.pdf")
# Returns: True
```

---

### `delete_files(s3_keys)`
Delete multiple files in batch.

```python
result = s3_service.delete_files([
    "uploads/user_123/file1.pdf",
    "uploads/user_123/file2.pdf"
])
# Returns: {deleted: 2, errors: 0, error_details: []}
```

---

### `file_exists(s3_key)`
Check if file exists.

```python
exists = s3_service.file_exists("uploads/user_123/uuid.pdf")
# Returns: True or False
```

---

### `get_file_metadata(s3_key)`
Get file metadata.

```python
metadata = s3_service.get_file_metadata("uploads/user_123/uuid.pdf")
# Returns: {size, content_type, last_modified, etag}
```

---

## File Constraints

- **File type:** PDF only (`application/pdf`)
- **Max size:** 25MB (configurable in `.env`)
- **Expiration:** Upload URLs expire in 1 hour
- **Naming:** Files renamed with UUID to prevent conflicts

---

## Security Considerations

### Presigned URLs
✅ URLs expire after 1 hour  
✅ Includes signature verification  
✅ Enforces content type  
✅ Enforces file size limit  

### File Access
✅ S3 bucket not publicly accessible  
✅ Downloads require presigned URLs  
✅ Files organized by user ID  

### Validation
✅ File type validated on init  
✅ File size checked after upload  
✅ Filename sanitized before storage  

---

## Error Handling

### Common Errors

**400 Bad Request**
- Invalid file type (not PDF)
- Invalid filename (no .pdf extension)
- File exceeds max size

**404 Not Found**
- File doesn't exist in S3 (during verify)

**500 Internal Server Error**
- S3 connection failure
- AWS credentials invalid
- Bucket doesn't exist

---

## Testing

### Test S3 Connection
```bash
python scripts/test_s3.py
```

### Test Upload Endpoints
```bash
python scripts/test_upload_api.py
```

### Manual Testing with cURL

**Initialize upload:**
```bash
curl -X POST http://localhost:3001/v1/uploads/init \
  -H "Content-Type: application/json" \
  -d '{"file_type": "application/pdf", "filename": "test.pdf"}'
```

**Upload to S3** (use response from above):
```bash
curl -X POST "UPLOAD_URL_FROM_RESPONSE" \
  -F "key=S3_KEY_FROM_RESPONSE" \
  -F "Content-Type=application/pdf" \
  -F "policy=POLICY_FROM_RESPONSE" \
  -F "x-amz-algorithm=..." \
  -F "x-amz-credential=..." \
  -F "x-amz-date=..." \
  -F "x-amz-signature=..." \
  -F "file=@/path/to/local/test.pdf"
```

**Verify upload:**
```bash
curl http://localhost:3001/v1/uploads/verify/S3_KEY_FROM_RESPONSE
```

---

## Configuration

### Environment Variables

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET_NAME=prisere-policy-uploads
AWS_REGION=us-east-1

# File Upload Settings
MAX_FILE_SIZE_MB=25
ALLOWED_FILE_TYPES=application/pdf
```

---

## Troubleshooting

### "Failed to generate upload URL"
- Check AWS credentials in `.env`
- Verify bucket exists and is accessible
- Check IAM permissions (PutObject required)

### "File not found" after upload
- Wait a few seconds for S3 consistency
- Check S3 key matches exactly
- Verify upload actually succeeded

### "Access Denied" errors
- Check IAM user has `s3:PutObject`, `s3:GetObject`, `s3:DeleteObject`
- Verify bucket policy allows access
- Check bucket is in correct region

---

## Next Steps

- Integrate with analysis job creation
- Add background job to clean up old files
- Implement user-specific access controls
- Add virus scanning before processing

