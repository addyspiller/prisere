# Prisere Insurance Policy Comparison Backend

FastAPI backend for comparing insurance policy renewals using Claude AI.

## Features

- **PDF Upload & Storage**: Secure upload to AWS S3
- **Text Extraction**: Extract text from PDF insurance policies
- **AI Analysis**: Compare policies using Claude API
- **Job Processing**: Asynchronous analysis with status tracking
- **Authentication**: Clerk-based user authentication
- **Database**: PostgreSQL for job tracking and results storage

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Storage**: AWS S3 (boto3)
- **AI**: Anthropic Claude API
- **PDF Processing**: pypdf, pdfplumber
- **Authentication**: Clerk

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL database
- AWS account with S3 bucket
- Anthropic API key
- Clerk account

### Installation

1. **Create and activate virtual environment**:
```bash
cd backend
python -m venv venv
```

**On Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**On Linux/Mac:**
```bash
source venv/bin/activate
```

2. **Install dependencies**:

**On Windows (PowerShell) - Recommended installation order:**
```powershell
# Step 1: Upgrade pip, setuptools, and wheel to ensure latest versions
python -m pip install --upgrade pip setuptools wheel

# Step 2: Install psycopg2-binary first (requires pre-compiled binaries)
pip install psycopg2-binary==2.9.9

# Step 3: Install remaining requirements
pip install -r requirements.txt
```

**On Linux/Mac:**
```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

> **Note for Windows:** `psycopg2-binary` is used instead of `psycopg2` because:
> - `psycopg2` requires `pg_config` and PostgreSQL development libraries to compile from source
> - On Windows, this requires installing PostgreSQL dev tools or Visual C++ build tools
> - `psycopg2-binary` includes pre-compiled binaries, avoiding compilation entirely
> - Installing it separately first ensures it completes before other packages that might have compilation issues

3. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your actual credentials
```

4. **Set up database**:

**Option A: Using Alembic migrations (Recommended for production)**:
```bash
# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Review the generated migration in alembic/versions/

# Apply migrations
alembic upgrade head
```

**Option B: Quick setup for development**:
```bash
python scripts/init_db.py
```

5. **Run the server**:
```bash
python -m app.main
# Or with uvicorn directly:
uvicorn app.main:app --reload --port 3001
```

The API will be available at `http://localhost:3001`

## API Documentation

When running in development mode, visit:
- Swagger UI: `http://localhost:3001/docs`
- ReDoc: `http://localhost:3001/redoc`

## Project Structure

```
backend/
├── alembic/                 # Database migrations
│   ├── versions/            # Migration files
│   ├── env.py              # Alembic environment config
│   └── script.py.mako      # Migration template
├── app/
│   ├── __init__.py
│   ├── main.py             # FastAPI app & configuration
│   ├── config.py           # Settings & environment variables
│   ├── database.py         # Database connection & session
│   ├── models/             # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py         # User model
│   │   ├── analysis_job.py # AnalysisJob model
│   │   └── analysis_result.py # AnalysisResult model
│   ├── routers/            # API endpoints
│   │   └── __init__.py
│   ├── services/           # Business logic
│   │   └── __init__.py
│   └── utils/              # Helper functions
│       └── __init__.py
├── scripts/                # Utility scripts
│   ├── init_db.py          # Initialize database
│   └── create_migration.py # Create Alembic migration
├── alembic.ini             # Alembic configuration
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variable template
├── .gitignore
└── README.md
```

## Environment Variables

See `.env.example` for all required configuration values.

## Health Check

```bash
curl http://localhost:3001/health
```

## Database Models

### Users
- `id` (String, PK): Clerk user ID
- `email` (String, unique)
- `name` (String, nullable)
- `company_name` (String, nullable)
- Timestamps: `created_at`, `updated_at`

### AnalysisJobs
- `id` (UUID, PK)
- `user_id` (FK to Users)
- `status` (Enum: pending, processing, completed, failed)
- `progress` (Integer: 0-100)
- `status_message` (String)
- S3 keys: `baseline_s3_key`, `renewal_s3_key`
- Filenames: `baseline_filename`, `renewal_filename`
- `error_message` (Text, nullable)
- Timestamps: `created_at`, `updated_at`, `started_at`, `completed_at`
- Metadata: `metadata_company_name`, `metadata_policy_type`

### AnalysisResults
- `job_id` (FK to AnalysisJobs, PK - one-to-one)
- `total_changes` (Integer)
- `change_categories` (JSON)
- `changes` (JSON array)
- `premium_comparison` (JSON)
- `suggested_actions` (JSON array)
- `educational_insights` (JSON array)
- `confidence_score` (Float: 0.0-1.0)
- `analysis_version`, `model_version`
- `processing_time_seconds` (Integer)
- Timestamp: `created_at`

## Database Management

### Create Migration
```bash
alembic revision --autogenerate -m "Description"
# or use helper script:
python scripts/create_migration.py "Description"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Rollback Migration
```bash
alembic downgrade -1
```

### Check Current Version
```bash
alembic current
```

## Authentication

The API uses **Clerk** for authentication with JWT token verification.

### Protected Endpoints

Include JWT token in Authorization header:
```bash
Authorization: Bearer <your-jwt-token>
```

### Auth Endpoints

- `GET /v1/auth/verify` - Verify token is valid
- `GET /v1/auth/me` - Get current user profile
- `PATCH /v1/auth/me` - Update user profile
- `DELETE /v1/auth/me` - Delete user account

See [Authentication Guide](docs/AUTHENTICATION.md) for detailed documentation.

### Example Request

```bash
curl -H "Authorization: Bearer your-token" \
  http://localhost:3001/v1/auth/me
```

## Upload Endpoints

File uploads use presigned S3 URLs for direct client-to-S3 uploads.

### Upload Flow

1. **Initialize:** `POST /v1/uploads/init` - Get presigned URL
2. **Upload:** POST file to presigned URL (direct to S3)
3. **Verify:** `GET /v1/uploads/verify/{s3_key}` - Confirm upload

### Endpoints

- `POST /v1/uploads/init` - Initialize upload (returns presigned URL)
- `GET /v1/uploads/verify/{s3_key}` - Verify file uploaded
- `DELETE /v1/uploads/{s3_key}` - Delete file from S3

See [S3 Upload Guide](docs/S3_UPLOAD_GUIDE.md) for detailed documentation.

### File Constraints

- **Type:** PDF only
- **Max size:** 25MB
- **URL expiration:** 1 hour

## PDF Processing

Extract text and metadata from PDF insurance policies.

### PDF Service Methods

- `extract_text_from_bytes(pdf_bytes)` - Extract text from PDF
- `get_pdf_metadata(pdf_bytes)` - Get page count and metadata
- `validate_pdf(pdf_bytes)` - Check if PDF is valid
- `extract_text_with_metadata(pdf_bytes)` - Get both text and metadata

### Test PDF Service

```bash
python scripts/test_pdf_service.py
```

## Claude AI Integration

Compare insurance policies using Claude 3.5 Sonnet.

### Claude Service Methods

- `compare_policies(baseline_text, renewal_text)` - Compare two policies
- Returns structured JSON with:
  - `summary` - High-level overview of changes
  - `coverage_changes` - Array of specific differences
  - `premium_comparison` - Premium amounts and changes
  - `broker_questions` - Suggested questions for broker

### Configuration

- **Model:** Claude 3.5 Sonnet (`claude-3-5-sonnet-20241022`)
- **Temperature:** 0.2 (low for consistency)
- **Max tokens:** 16,000

### Test Claude Service

```bash
python scripts/test_claude_service.py
```

**Note:** Requires `ANTHROPIC_API_KEY` in `.env`

## Analysis Endpoints

Create and manage policy comparison jobs.

### Endpoints

- `POST /v1/analyses` - Create analysis job (returns job_id, starts background processing)
- `GET /v1/analyses/{job_id}/status` - Get job status and progress (for polling)
- `GET /v1/analyses/{job_id}/result` - Get full results (only when completed)
- `GET /v1/analyses` - List all user's jobs
- `DELETE /v1/analyses/{job_id}` - Delete job and results

### Analysis Flow

1. **Upload PDFs** → Get S3 keys
2. **Create analysis** → `POST /v1/analyses` with S3 keys
3. **Poll status** → `GET /v1/analyses/{job_id}/status` every few seconds
4. **Get results** → `GET /v1/analyses/{job_id}/result` when status is "completed"

### Background Processing

Jobs are processed asynchronously:
1. Download PDFs from S3
2. Extract text from both PDFs
3. Compare with Claude AI
4. Save results to database
5. Delete PDFs from S3 (always, even if failed)
6. Update job status throughout

### Job Status

- `pending` - Job created, not started yet
- `processing` - Currently processing (0-100% progress)
- `completed` - Successfully completed
- `failed` - Processing failed (error_message included)

## Deployment

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete production deployment instructions for Render.com.

Quick deploy:
1. Push code to GitHub
2. Create PostgreSQL database on Render
3. Create Web Service on Render
4. Add environment variables
5. Run `alembic upgrade head` in Render Shell
6. Done! ✅

## Next Steps

- [x] Database models and migrations
- [x] Clerk authentication middleware (disabled for testing)
- [x] S3 upload service
- [x] PDF extraction service
- [x] Claude AI integration
- [x] Analysis endpoints
- [x] Background job processing
- [x] Deployment configuration (render.yaml)
- [ ] Re-enable authentication with Clerk keys
- [ ] Production deployment to Render

