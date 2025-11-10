# Prisere Insurance Renewal Comparison Tool – Backend PRD

## 1. Backend Scope & Responsibilities

**What the backend does:**
- Receives policy PDF uploads from frontend
- Authenticates and authorizes user requests
- Temporarily stores PDFs during processing
- Sends PDFs to Claude API for analysis with R/Y/G classification
- Parses and structures AI responses including risk flags
- Stores comparison results
- Provides results to frontend via API
- Manages data lifecycle (auto-delete PDFs)
- Includes legal disclaimers in all responses

---

## 2. Tech Stack & Infrastructure

| Component | Purpose | Description | Monthly Cost |
| --- | --- | --- | --- |
| Python 3.11+ | Backend programming | Main language for handling logic, API endpoints, and background tasks | Free |
| FastAPI | REST API & async processing | Serves requests from frontend, handles file uploads, responses, and background tasks | Free |
| Render.com | Hosting | Runs the backend 24/7 | $25 |
| PostgreSQL 15+ | Database | Stores users, jobs, and comparison results | Included with hosting |
| AWS S3 | Temporary file storage | Stores uploaded PDFs while processing | <$1 |
| Claude API (3.5 Sonnet) | AI analysis | Compares policies and generates red/yellow/green flags | ~$0.10 per comparison |
| Clerk.dev | Authentication | Verifies user identity and manages access | Free up to 10K users |

---

## 3. Step-by-Step System Flow

### Step 1: User Uploads Policy PDFs
**What happens:**
- User selects their current policy and renewal policy PDFs in the frontend
- Both PDFs are sent securely to the backend

**Backend role:**
- Validates that files are PDFs and under 25MB
- Confirms the user is authenticated
- Temporarily stores PDFs in AWS S3

**Tech Stack:**
- FastAPI – handles file upload and validation
- AWS S3 – temporary storage
- Clerk.dev – authentication
- **Cost:** <$1/month for storage

### Step 2: Create Comparison Job
**What happens:**
- Backend creates a unique job ID for this comparison
- Saves job details in the database with status `processing`
- Returns the job ID to the frontend immediately (frontend can show "processing…")

**Tech Stack:**
- PostgreSQL – stores job info
- FastAPI – handles request and response
- **Cost:** Included in hosting

### Step 3: Background AI Analysis
**What happens:**
- Backend retrieves PDFs from temporary storage
- Sends PDFs to Claude API to analyze differences
- Claude classifies each change as **Red / Yellow / Green** based on coverage, premium, deductibles, etc.
- Generates a summary, detailed changes, and suggested broker questions

**Tech Stack:**
- Claude API – AI analysis ($0.10 per comparison)
- Python background tasks – orchestrates the process
- **Processing time:** ~1-2 minutes per job
- **Cost:** ~$0.10 per comparison

### Step 4: Parse & Store Results
**What happens:**
- Backend receives AI output in structured format
- Validates the results
- Saves results to PostgreSQL under the job record
- Marks job as `completed`
- Deletes PDFs from temporary storage to protect user privacy

**Tech Stack:**
- PostgreSQL – store structured results
- Python – parse and validate AI results
- AWS S3 – delete PDFs after processing
- **Cost:** Included in hosting + <$0.01 for S3 deletes

### Step 5: Check Job Status
**What happens:**
- Frontend can poll the backend to check job status using the job ID
- Backend returns status: `processing`, `completed`, or `failed`

**Tech Stack:**
- FastAPI – handles API request
- PostgreSQL – queries job status
- **Cost:** Free / Included

### Step 6: Retrieve Comparison Results
**What happens:**
- Once the job is `completed`, frontend requests results
- Backend sends the full comparison: summary, detailed changes, premium differences, and broker questions

**Tech Stack:**
- FastAPI – JSON response
- PostgreSQL – fetch results
- **Cost:** Free / Included

### Step 7: Present Comparison Results (Flexible Display)
**What happens:**
- Backend provides structured comparison results to frontend
- **Important:** How this information is displayed—whether in a PDF, web page, dashboard, or other format—is determined by the frontend
- Backend ensures results are complete and structured so the frontend can display them in the desired format

**Tech Stack:**
- FastAPI – JSON response with structured results
- PostgreSQL – fetch results
- **Cost:** Free / Included

### Step 8: Data Privacy & Lifecycle
**PDFs:**
- Stored temporarily (~2 minutes)
- Deleted immediately after processing (max 24h if job fails)

**Results:**
- Stored for 12 months in the database for user access
- Includes summary, flags, and broker questions
- Users can request deletion at any time

**Tech Stack:**
- AWS S3 – temporary PDF storage
- PostgreSQL – results storage

### Step 9: Error Handling
**What happens if something goes wrong:**
- Claude API fails → mark job `failed` and log error
- JSON parse fails → mark job `failed`
- Any other issue → mark job `failed`
- Always delete temporary PDFs to ensure privacy

**Tech Stack:**
- Python – error handling and logging
- PostgreSQL – store error messages
- AWS S3 – cleanup

---

## 4. API Endpoints

### Authentication
All endpoints require valid JWT token from Clerk.dev in Authorization header.

### Core Endpoints

#### `POST /v1/uploads/init`
- Returns pre-signed S3 URLs for direct file upload
- Response includes upload URLs and file keys

#### `POST /v1/analyses`
- Creates new comparison job
- Request: `{ "baseline_key": "s3-key", "renewal_key": "s3-key" }`
- Response: `{ "job_id": "uuid", "status": "processing" }`

#### `GET /v1/analyses/{job_id}/status`
- Returns current job status
- Response: `{ "status": "processing|completed|failed", "progress": 0-100 }`

#### `GET /v1/analyses/{job_id}`
- Returns full comparison results (only when completed)
- Response includes:
  - Summary
  - Detailed changes with R/Y/G classifications
  - Premium differences
  - Broker questions
  - Confidence scores

#### `GET /v1/analyses`
- Lists user's past analyses
- Paginated response with basic metadata

#### `DELETE /v1/analyses/{job_id}`
- Allows user to delete their analysis results
- Soft delete with 30-day retention for recovery

---

## 5. Database Schema

### Users Table
```sql
- id (UUID, primary key)
- clerk_user_id (unique)
- email
- company_name
- created_at
- updated_at
```

### Jobs Table
```sql
- id (UUID, primary key)
- user_id (foreign key)
- baseline_s3_key
- renewal_s3_key
- status (enum: processing, completed, failed)
- progress (integer 0-100)
- error_message (nullable)
- created_at
- completed_at (nullable)
- deleted_at (nullable)
```

### Results Table
```sql
- id (UUID, primary key)
- job_id (foreign key)
- summary (JSON)
- changes (JSON array)
- premium_comparison (JSON)
- broker_questions (JSON array)
- confidence_scores (JSON)
- created_at
```

---

## 6. Security Requirements

### Data Protection
- All API endpoints use HTTPS
- PDFs encrypted in S3 with customer-managed keys
- Database connections use SSL
- No logging of file contents or personal data

### Authentication & Authorization
- Clerk.dev handles user authentication
- Backend validates JWT on every request
- Users can only access their own data
- Rate limiting: 10 requests/minute per user

### Compliance
- GDPR-ready with data deletion capabilities
- Audit trail for all data access
- Regular security scans of dependencies

---

## 7. Performance Requirements

### Response Times
- Upload initialization: <500ms
- Job creation: <1s
- Status check: <200ms
- Results retrieval: <2s

### Scalability
- Handle 100 concurrent uploads
- Process 1000 comparisons/day
- 99.9% uptime target

### Monitoring
- APM with Datadog or New Relic
- Error tracking with Sentry
- Custom metrics for job processing times

---

## 8. Development & Deployment

### Local Development
- Docker Compose for PostgreSQL and S3 (LocalStack)
- Environment variables for all secrets
- Comprehensive test suite (unit + integration)

### CI/CD
- GitHub Actions for testing and deployment
- Automated database migrations
- Blue-green deployments on Render

### Environments
- Development: Local Docker
- Staging: Render preview environments
- Production: Render with auto-scaling