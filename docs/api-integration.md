# API Integration Specification

## Overview

This document defines the API contract between the frontend and backend teams for the Insurance Renewal Comparison Tool. Both teams should reference this specification to ensure seamless integration.

**Note on Risk Assessment Changes (Updated):** 
The frontend team has moved away from R/Y/G risk classifications to avoid liability concerns around providing insurance advice. The API now returns factual change data (amounts, types, categories) without evaluating adequacy or risk levels. The frontend provides educational context separately from the factual reporting.

---

## API Versioning

- All endpoints are namespaced under `/v1/`
- Breaking changes will be introduced under `/v2/` with backward compatibility
- Frontend includes version header: `x-api-version: 1.0`

---

## Authentication

All API requests require a valid JWT token from Clerk.dev:

```
Authorization: Bearer <jwt_token>
```

---

## Core API Endpoints

### 1. Initialize Upload Session

**Purpose**: Get pre-signed S3 URLs for direct file upload

```
POST /v1/uploads/init
```

**Request Body**:
```json
{
  "file_count": 2,
  "file_types": ["application/pdf", "application/pdf"]
}
```

**Response** (200 OK):
```json
{
  "upload_urls": [
    {
      "url": "https://s3.amazonaws.com/...",
      "key": "uploads/user123/baseline-uuid.pdf",
      "expires_at": "2024-01-01T12:00:00Z"
    },
    {
      "url": "https://s3.amazonaws.com/...",
      "key": "uploads/user123/renewal-uuid.pdf",
      "expires_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 2. Create Analysis Job

**Purpose**: Start a new policy comparison analysis

```
POST /v1/analyses
```

**Request Body**:
```json
{
  "baseline_key": "uploads/user123/baseline-uuid.pdf",
  "renewal_key": "uploads/user123/renewal-uuid.pdf",
  "metadata": {
    "company_name": "ABC Corp",
    "policy_type": "general_liability"
  }
}
```

**Response** (201 Created):
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "created_at": "2024-01-01T10:00:00Z",
  "estimated_completion": "2024-01-01T10:02:00Z"
}
```

### 3. Check Job Status

**Purpose**: Poll for job completion status

```
GET /v1/analyses/{job_id}/status
```

**Response** (200 OK):
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing", // processing | completed | failed
  "progress": 45, // 0-100
  "message": "Analyzing policy exclusions...",
  "updated_at": "2024-01-01T10:01:00Z"
}
```

### 4. Get Analysis Results

**Purpose**: Retrieve completed analysis results

```
GET /v1/analyses/{job_id}
```

**Response** (200 OK) - Only when status is "completed":
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "summary": {
    "total_changes": 12,
    "change_categories": {
      "coverage_limits": 3,
      "deductibles": 2,
      "exclusions": 4,
      "terms_conditions": 3
    }
  },
  "changes": [
    {
      "id": "change-1",
      "category": "coverage_limit",
      "change_type": "decreased", // increased | decreased | added | removed | modified
      "title": "General Liability Coverage Changed",
      "description": "General liability coverage limit changed from $2M to $1M",
      "baseline_value": "$2,000,000",
      "renewal_value": "$1,000,000",
      "change_amount": "-$1,000,000",
      "percentage_change": -50,
      "confidence": 0.92,
      "page_references": {
        "baseline": [12, 15],
        "renewal": [11, 14]
      }
    },
    {
      "id": "change-2",
      "category": "deductible",
      "change_type": "increased",
      "title": "Property Damage Deductible Changed",
      "description": "Property damage deductible changed from $2,500 to $3,500",
      "baseline_value": "$2,500",
      "renewal_value": "$3,500",
      "change_amount": "+$1,000",
      "percentage_change": 40,
      "confidence": 0.88,
      "page_references": {
        "baseline": [8],
        "renewal": [8]
      }
    }
  ],
  "premium_comparison": {
    "baseline_premium": 15000,
    "renewal_premium": 16500,
    "difference": 1500,
    "percentage_change": 10
  },
  "suggested_actions": [
    {
      "category": "coverage_limit",
      "action": "Review with broker why general liability coverage decreased from $2M to $1M",
      "educational_context": "Lower liability limits mean less protection for lawsuits and claims"
    },
    {
      "category": "deductible",
      "action": "Consider asking about options to maintain the previous $2,500 deductible",
      "educational_context": "Higher deductibles mean more out-of-pocket costs when filing claims"
    }
  ],
  "educational_insights": [
    {
      "change_type": "coverage_limit_decrease",
      "insight": "When coverage limits decrease, it means your maximum protection amount is lower"
    },
    {
      "change_type": "deductible_increase",
      "insight": "Increased deductibles reduce premiums but increase your costs when claiming"
    }
  ],
  "metadata": {
    "analysis_version": "1.0",
    "model_version": "claude-3.5-sonnet",
    "processing_time_seconds": 87,
    "completed_at": "2024-01-01T10:01:27Z"
  }
}
```

### 5. List User's Analyses

**Purpose**: Get paginated list of user's past analyses

```
GET /v1/analyses?page=1&limit=10
```

**Response** (200 OK):
```json
{
  "analyses": [
    {
      "job_id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "company_name": "ABC Corp",
      "total_changes": 8,
      "created_at": "2024-01-01T10:00:00Z",
      "completed_at": "2024-01-01T10:01:27Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "has_next": true
  }
}
```

### 6. Delete Analysis

**Purpose**: Allow users to delete their analysis data

```
DELETE /v1/analyses/{job_id}
```

**Response** (204 No Content)

---

## Error Responses

All errors follow consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file format. Only PDF files are supported.",
    "details": {
      "field": "baseline_file",
      "reason": "mime_type_mismatch"
    }
  },
  "request_id": "req-123456"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing JWT token |
| FORBIDDEN | 403 | User doesn't have access to resource |
| NOT_FOUND | 404 | Job ID not found |
| VALIDATION_ERROR | 400 | Invalid request parameters |
| FILE_TOO_LARGE | 413 | PDF exceeds 25MB limit |
| PROCESSING_ERROR | 500 | AI analysis failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |

---

## WebSocket Events (Future Enhancement)

For real-time status updates instead of polling:

```javascript
// Connect to WebSocket
ws://api.prisere.com/v1/ws/analyses/{job_id}

// Receive events
{
  "event": "progress",
  "data": {
    "progress": 75,
    "message": "Analyzing premium changes..."
  }
}

{
  "event": "completed",
  "data": {
    "job_id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## Development & Testing

### Mock Server

Frontend team should use mock data during development:

```javascript
// Example mock response generator
const mockAnalysisResult = {
  job_id: "mock-job-id",
  status: "completed",
  summary: {
    overall_risk: "yellow",
    total_changes: 8,
    critical_changes: 1,
    moderate_changes: 3,
    minor_changes: 4
  },
  changes: generateMockChanges(),
  premium_comparison: {
    baseline_premium: 15000,
    renewal_premium: 16500,
    difference: 1500,
    percentage_change: 10
  },
  broker_questions: generateMockQuestions()
};
```

### Integration Testing

1. Use staging environment with test Clerk accounts
2. Test file size limits and timeouts
3. Verify error handling for all edge cases
4. Test concurrent job processing