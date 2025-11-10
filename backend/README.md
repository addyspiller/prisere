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

## Next Steps

- [x] Database models and migrations
- [x] Clerk authentication middleware
- [ ] S3 upload service
- [ ] PDF extraction service
- [ ] Claude AI integration
- [ ] Analysis endpoints
- [ ] Background job processing

