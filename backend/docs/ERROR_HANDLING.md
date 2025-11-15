# Error Handling & Logging

This document explains the error handling middleware, structured logging, and legal disclaimer system implemented in the Prisere API.

---

## Overview

The Prisere API implements comprehensive error handling with:
- **Custom exception handlers** for different error types
- **Structured logging** with timestamps and color coding
- **Legal disclaimers** on all responses (including errors)
- **Request tracking** with timing information

---

## Exception Handlers

### 1. HTTP Exception Handler

**Handles:** 404, 403, 401, and other HTTP errors

**Response Format:**
```json
{
  "error": {
    "type": "http_error",
    "status_code": 404,
    "message": "Not Found",
    "path": "/v1/analyses/invalid-id"
  },
  "disclaimer": "This tool provides automated detection..."
}
```

**Example:**
```bash
# Request non-existent endpoint
curl http://localhost:3001/v1/invalid

# Response (404)
{
  "error": {
    "type": "http_error",
    "status_code": 404,
    "message": "Not Found",
    "path": "/v1/invalid"
  },
  "disclaimer": "..."
}
```

---

### 2. Validation Error Handler

**Handles:** Invalid request body, query parameters, or path parameters

**Response Format:**
```json
{
  "error": {
    "type": "validation_error",
    "status_code": 422,
    "message": "The request contains invalid data. Please check the fields below.",
    "path": "/v1/analyses",
    "validation_errors": [
      {
        "field": "body -> baseline_s3_key",
        "message": "field required",
        "type": "value_error.missing"
      }
    ]
  },
  "disclaimer": "This tool provides automated detection..."
}
```

**Example:**
```bash
# Send invalid JSON to create analysis
curl -X POST http://localhost:3001/v1/analyses \
  -H "Content-Type: application/json" \
  -d '{}'

# Response (422)
{
  "error": {
    "type": "validation_error",
    "status_code": 422,
    "message": "The request contains invalid data...",
    "validation_errors": [
      {"field": "body -> baseline_s3_key", "message": "field required", ...}
    ]
  },
  "disclaimer": "..."
}
```

---

### 3. General Exception Handler

**Handles:** Unexpected errors (database errors, API failures, etc.)

**Response Format:**
```json
{
  "error": {
    "type": "internal_error",
    "status_code": 500,
    "message": "An unexpected error occurred while processing your request. Please try again later.",
    "path": "/v1/analyses"
  },
  "disclaimer": "This tool provides automated detection..."
}
```

**Logging:** Full exception with stack trace is logged for debugging

**Example:**
```bash
# Trigger database connection error
curl http://localhost:3001/v1/analyses

# Response (500)
{
  "error": {
    "type": "internal_error",
    "status_code": 500,
    "message": "An unexpected error occurred...",
    "path": "/v1/analyses"
  },
  "disclaimer": "..."
}
```

---

## Legal Disclaimer

### Purpose

The legal disclaimer:
- ✅ Clarifies what the tool does (automated comparison)
- ✅ Clarifies what it doesn't do (no recommendations or advice)
- ✅ Emphasizes user responsibility (consult licensed professionals)
- ✅ Appears on **all responses** (including errors)

### Full Text

> "This tool provides automated detection and comparison of changes between your insurance policies. It reports factual differences found in the documents you upload and offers general educational information about insurance terms. This tool does not evaluate coverage adequacy, make recommendations, or provide legal or financial advice. The system analyzes only the two policy documents you upload. No external data, prior records, or third-party sources are used in the analysis. Always consult with your licensed insurance broker or provider to understand how these changes affect your specific business needs."

### Usage

```python
from app.utils.legal import get_legal_disclaimer, get_disclaimer_dict

# Get as string
disclaimer = get_legal_disclaimer()

# Get as dict (for JSON responses)
disclaimer_dict = get_disclaimer_dict()
# Returns: {"disclaimer": "This tool provides..."}
```

---

## Structured Logging

### Log Levels

The API uses standard Python logging levels:
- **DEBUG:** Detailed information for diagnosing problems
- **INFO:** General informational messages
- **WARNING:** Warning messages for potential issues
- **ERROR:** Error messages for failures
- **CRITICAL:** Critical errors requiring immediate attention

### Configuration

Set log level in `.env`:
```bash
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

### Log Format

**Console (colored):**
```
2025-11-15 16:25:28 - app.routers.analyses - INFO - Created analysis job: a2d37ac3...
```

**File (logs/prisere_YYYYMMDD.log):**
```
2025-11-15 16:25:28 - app.routers.analyses - INFO - Created analysis job: a2d37ac3...
```

### Request Logging

All HTTP requests are automatically logged with:
- **Method** (GET, POST, etc.)
- **Path** (/v1/analyses)
- **Status Code** (200, 404, 500)
- **Duration** (in milliseconds)
- **Client IP**

**Example:**
```
2025-11-15 16:25:28 - app.main - INFO - POST /v1/analyses 201 (125.43ms)
```

### Custom Logging

```python
import logging

logger = logging.getLogger(__name__)

# Log with structured data
logger.info(
    "Analysis job completed",
    extra={
        "job_id": job.id,
        "user_id": job.user_id,
        "processing_time_seconds": 5.2
    }
)
```

---

## Log Files

### Location

Logs are stored in `backend/logs/`:
```
backend/logs/
  ├── README.md
  ├── .gitignore
  ├── prisere_20251115.log
  ├── prisere_20251116.log
  └── ...
```

### Rotation

- **Daily rotation:** New log file created each day
- **File naming:** `prisere_YYYYMMDD.log`
- **Git ignored:** Log files are not committed to git

### Viewing Logs

**Tail logs in real-time:**
```powershell
# PowerShell
Get-Content backend/logs/prisere_20251115.log -Wait -Tail 50
```

**Search logs:**
```powershell
# Search for errors
Get-Content backend/logs/prisere_20251115.log | Select-String "ERROR"

# Search for specific job ID
Get-Content backend/logs/prisere_20251115.log | Select-String "a2d37ac3"
```

---

## Error Response Examples

### 404 Not Found

```json
{
  "error": {
    "type": "http_error",
    "status_code": 404,
    "message": "Analysis job not found",
    "path": "/v1/analyses/invalid-id/status"
  },
  "disclaimer": "This tool provides automated detection..."
}
```

### 422 Validation Error

```json
{
  "error": {
    "type": "validation_error",
    "status_code": 422,
    "message": "The request contains invalid data. Please check the fields below.",
    "path": "/v1/analyses",
    "validation_errors": [
      {
        "field": "body -> baseline_s3_key",
        "message": "field required",
        "type": "value_error.missing"
      },
      {
        "field": "body -> renewal_s3_key",
        "message": "field required",
        "type": "value_error.missing"
      }
    ]
  },
  "disclaimer": "This tool provides automated detection..."
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "type": "internal_error",
    "status_code": 500,
    "message": "An unexpected error occurred while processing your request. Please try again later.",
    "path": "/v1/analyses/a2d37ac3/result"
  },
  "disclaimer": "This tool provides automated detection..."
}
```

---

## Testing Error Handling

### Test HTTP Errors

```powershell
# 404 Not Found
Invoke-RestMethod -Uri "http://localhost:3001/v1/invalid" -ErrorAction SilentlyContinue

# 404 Analysis Not Found
Invoke-RestMethod -Uri "http://localhost:3001/v1/analyses/invalid-id/status" -ErrorAction SilentlyContinue
```

### Test Validation Errors

```powershell
# Missing required fields
$body = @{} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:3001/v1/analyses" `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body `
  -ErrorAction SilentlyContinue

# Invalid S3 key format
$body = @{
  baseline_s3_key = "invalid key with spaces"
  renewal_s3_key = "uploads/test.pdf"
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri "http://localhost:3001/v1/analyses" `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body `
  -ErrorAction SilentlyContinue
```

### Test General Errors

**Simulate database error:**
1. Stop PostgreSQL: `Stop-Service postgresql-x64-15`
2. Make any API request
3. Should return 500 Internal Server Error
4. Restart PostgreSQL: `Start-Service postgresql-x64-15`

---

## Middleware Architecture

### Order of Execution

1. **CORS Middleware** - Handle cross-origin requests
2. **Request Logging Middleware** - Log all requests with timing
3. **Route Handler** - Process the request
4. **Exception Handlers** - Catch and format errors
5. **Response** - Return JSON with disclaimer

### Middleware Flow

```
Request
  ↓
CORS Check
  ↓
Start Timer
  ↓
Route Handler
  ↓
Exception? → Exception Handler → Format Error + Disclaimer
  ↓
Success? → Return Response + Disclaimer
  ↓
Log Request (method, path, status, duration)
  ↓
Response
```

---

## Best Practices

### 1. Always Include Context in Logs

```python
# ❌ Bad
logger.error("Analysis failed")

# ✅ Good
logger.error(
    f"Analysis failed for job {job_id}",
    extra={
        "job_id": job_id,
        "user_id": user_id,
        "error_type": type(e).__name__
    }
)
```

### 2. Use Appropriate Log Levels

- **DEBUG:** Trace execution flow, variable values
- **INFO:** Business events (job created, file uploaded)
- **WARNING:** Recoverable issues (file not found, retry attempt)
- **ERROR:** Failures requiring attention (API error, database error)
- **CRITICAL:** System failures (can't connect to DB, out of memory)

### 3. Don't Log Sensitive Data

```python
# ❌ Bad - logs API keys
logger.info(f"Using API key: {api_key}")

# ✅ Good - logs masked key
logger.info(f"Using API key: {api_key[:8]}...")
```

### 4. Use Structured Extra Data

```python
# Structured data can be parsed by log analysis tools
logger.info(
    "Job completed successfully",
    extra={
        "job_id": job.id,
        "processing_time_seconds": 5.2,
        "total_changes": 12,
        "model_version": "claude-3-haiku-20240307"
    }
)
```

---

## Troubleshooting

### Issue: Logs not appearing

**Solution:**
1. Check `LOG_LEVEL` in `.env` (should be `INFO` or `DEBUG`)
2. Restart the server: `uvicorn app.main:app --reload --port 3001`
3. Check that `logs/` directory exists and is writable

### Issue: Too many logs (performance impact)

**Solution:**
1. Set `LOG_LEVEL=WARNING` in `.env`
2. Reduce third-party library logging in `logging_config.py`
3. Consider log aggregation service for production

### Issue: Error response missing disclaimer

**Solution:**
1. Verify exception handler is registered in `main.py`
2. Check that `general_exception_handler` is the last handler registered
3. Restart the server to apply changes

---

## Future Enhancements

- [ ] Structured JSON logging for production (e.g., `python-json-logger`)
- [ ] Log aggregation service integration (e.g., Datadog, CloudWatch)
- [ ] Error tracking service (e.g., Sentry)
- [ ] Rate limiting on error responses
- [ ] Custom error codes for frontend handling
- [ ] Request ID tracking across services

---

## Summary

✅ **Custom exception handlers** for HTTP, validation, and general errors  
✅ **Legal disclaimer** on all responses (including errors)  
✅ **Structured logging** with timestamps and color coding  
✅ **Request tracking** with method, path, status, and duration  
✅ **Daily log files** with automatic rotation  
✅ **Production-ready** error handling and logging

For more information, see:
- `backend/app/middleware/exception_handler.py` - Exception handlers
- `backend/app/utils/legal.py` - Legal disclaimer functions
- `backend/app/utils/logging_config.py` - Logging configuration
- `backend/app/main.py` - Middleware registration

