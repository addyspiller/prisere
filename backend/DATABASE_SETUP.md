# Database Setup Guide

## Overview

The backend uses **PostgreSQL** with **SQLAlchemy ORM** and **Alembic** for migrations.

## Database Models

### 1. Users (`users` table)

Stores authenticated user information from Clerk.

**Columns:**
- `id` (String, PK): Clerk user ID
- `email` (String, unique, indexed)
- `name` (String, nullable)
- `company_name` (String, nullable)
- `created_at` (DateTime)
- `updated_at` (DateTime)

**Relationships:**
- One-to-many with `AnalysisJob`

---

### 2. AnalysisJobs (`analysis_jobs` table)

Tracks policy comparison analysis jobs.

**Columns:**
- `id` (UUID, PK, indexed): Auto-generated UUID
- `user_id` (String, FK to users.id, indexed)
- `status` (Enum, indexed): `pending`, `processing`, `completed`, `failed`
- `progress` (Integer): 0-100
- `status_message` (String): Current processing message
- `baseline_s3_key` (String): S3 key for baseline PDF
- `renewal_s3_key` (String): S3 key for renewal PDF
- `baseline_filename` (String): Original baseline filename
- `renewal_filename` (String): Original renewal filename
- `error_message` (Text, nullable): Error details if failed
- `created_at` (DateTime, indexed)
- `updated_at` (DateTime)
- `started_at` (DateTime, nullable): When processing began
- `completed_at` (DateTime, nullable): When processing finished
- `metadata_company_name` (String, nullable)
- `metadata_policy_type` (String, nullable)

**Relationships:**
- Many-to-one with `User`
- One-to-one with `AnalysisResult`

**Methods:**
- `to_dict()`: Returns frontend-compatible dictionary
- `update_progress(progress, message)`: Update job progress
- `mark_processing()`: Mark job as processing
- `mark_completed()`: Mark job as completed
- `mark_failed(error_message)`: Mark job as failed

---

### 3. AnalysisResults (`analysis_results` table)

Stores completed policy comparison results.

**Columns:**
- `job_id` (UUID, PK, FK to analysis_jobs.id): One-to-one with job
- `total_changes` (Integer): Total number of detected changes
- `change_categories` (JSON): Breakdown by category
- `changes` (JSON array): Detailed changes list
- `premium_comparison` (JSON): Premium change data
- `suggested_actions` (JSON array): Broker questions/actions
- `educational_insights` (JSON array): Educational context
- `confidence_score` (Float): Average confidence (0.0-1.0)
- `analysis_version` (String): Analysis version (e.g., "1.0")
- `model_version` (String): Claude model used
- `processing_time_seconds` (Integer): Total processing time
- `created_at` (DateTime)

**Relationships:**
- One-to-one with `AnalysisJob`

**Methods:**
- `to_dict()`: Returns frontend-compatible dictionary
- `from_claude_response(job_id, claude_data, model_version, processing_time)`: Create from Claude API response

---

## Status Enum

```python
class JobStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
```

---

## Database Connection (`app/database.py`)

### Engine Configuration
- Connection pooling enabled (pool_size=5, max_overflow=10)
- Pre-ping enabled to check connection health
- SQL echo enabled in development mode

### Session Management

**For FastAPI routes:**
```python
from app.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends

@app.get("/endpoint")
def endpoint(db: Session = Depends(get_db)):
    # Use db session
    pass
```

**For background tasks/scripts:**
```python
from app.database import get_db_context

with get_db_context() as db:
    # Use db session
    # Auto-commits on success, rolls back on error
    pass
```

### Utility Functions
- `init_db()`: Create all tables (dev only)
- `check_db_connection()`: Verify database connectivity

---

## Alembic Migrations

### Setup

Alembic is already configured with:
- `alembic.ini`: Configuration file
- `alembic/env.py`: Environment setup (loads models)
- `alembic/versions/`: Migration files directory

### Creating Migrations

**Auto-generate from model changes:**
```bash
alembic revision --autogenerate -m "Add new field to users"
```

**Create empty migration (manual):**
```bash
alembic revision -m "Custom migration"
```

**Using helper script:**
```bash
python scripts/create_migration.py "Add new field to users"
```

### Applying Migrations

**Upgrade to latest:**
```bash
alembic upgrade head
```

**Upgrade by one version:**
```bash
alembic upgrade +1
```

**Downgrade by one version:**
```bash
alembic downgrade -1
```

**Downgrade to specific revision:**
```bash
alembic downgrade <revision_id>
```

### Checking Status

**Current version:**
```bash
alembic current
```

**Migration history:**
```bash
alembic history
```

**Show SQL without executing:**
```bash
alembic upgrade head --sql
```

---

## Initial Setup

### 1. Configure Database Connection

Edit `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/prisere
```

### 2. Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE prisere;
\q
```

### 3. Initialize Database

**Option A: Using Alembic (Recommended)**
```bash
# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Review generated migration in alembic/versions/

# Apply migration
alembic upgrade head
```

**Option B: Quick Setup (Development)**
```bash
python scripts/init_db.py
```

### 4. Verify Setup

```python
python -c "from app.database import check_db_connection; print('✅ Connected' if check_db_connection() else '❌ Failed')"
```

---

## Example Usage

### Creating a User

```python
from app.models import User
from app.database import get_db_context

with get_db_context() as db:
    user = User(
        id="clerk_user_123",
        email="user@example.com",
        name="John Doe",
        company_name="Acme Corp"
    )
    db.add(user)
```

### Creating an Analysis Job

```python
from app.models import AnalysisJob, JobStatus

with get_db_context() as db:
    job = AnalysisJob(
        user_id="clerk_user_123",
        status=JobStatus.PENDING,
        baseline_s3_key="uploads/user123/baseline.pdf",
        renewal_s3_key="uploads/user123/renewal.pdf",
        baseline_filename="current-policy.pdf",
        renewal_filename="renewal-quote.pdf"
    )
    db.add(job)
```

### Querying Jobs

```python
from app.models import AnalysisJob, JobStatus

with get_db_context() as db:
    # Get user's jobs
    jobs = db.query(AnalysisJob).filter(
        AnalysisJob.user_id == "clerk_user_123"
    ).order_by(AnalysisJob.created_at.desc()).all()
    
    # Get pending jobs
    pending = db.query(AnalysisJob).filter(
        AnalysisJob.status == JobStatus.PENDING
    ).all()
    
    # Get job with result
    job_with_result = db.query(AnalysisJob).filter(
        AnalysisJob.id == job_id
    ).first()
    
    if job_with_result and job_with_result.result:
        result_dict = job_with_result.result.to_dict()
```

### Updating Job Progress

```python
with get_db_context() as db:
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    
    # Start processing
    job.mark_processing()
    
    # Update progress
    job.update_progress(25, "Extracting text from PDFs...")
    job.update_progress(50, "Analyzing coverage changes...")
    
    # Complete
    job.mark_completed()
```

### Saving Analysis Results

```python
from app.models import AnalysisResult

# From Claude API response
claude_response = {
    "changes": [...],
    "summary": {...},
    "premium_comparison": {...},
    "suggested_actions": [...],
    "educational_insights": [...]
}

with get_db_context() as db:
    result = AnalysisResult.from_claude_response(
        job_id=job.id,
        claude_data=claude_response,
        model_version="claude-3-5-sonnet-20241022",
        processing_time=87
    )
    db.add(result)
```

---

## JSON Field Schemas

### `change_categories` (JSON)
```json
{
  "coverage_limit": 3,
  "deductible": 2,
  "exclusion": 4,
  "premium": 1,
  "terms_conditions": 2
}
```

### `changes` (JSON Array)
```json
[
  {
    "id": "change-1",
    "category": "coverage_limit",
    "change_type": "decreased",
    "title": "General Liability Coverage Changed",
    "description": "Coverage limit changed from $2M to $1M",
    "baseline_value": "$2,000,000",
    "renewal_value": "$1,000,000",
    "change_amount": "-$1,000,000",
    "percentage_change": -50,
    "confidence": 0.92,
    "page_references": {
      "baseline": [12, 15],
      "renewal": [11, 14]
    }
  }
]
```

### `premium_comparison` (JSON)
```json
{
  "baseline_premium": 15000,
  "renewal_premium": 16500,
  "difference": 1500,
  "percentage_change": 10
}
```

### `suggested_actions` (JSON Array)
```json
[
  {
    "category": "coverage_limit",
    "action": "Review with broker why coverage decreased",
    "educational_context": "Lower limits mean less protection"
  }
]
```

### `educational_insights` (JSON Array)
```json
[
  {
    "change_type": "coverage_limit_decrease",
    "insight": "When coverage limits decrease, protection is lower"
  }
]
```

---

## Troubleshooting

### Connection Errors

**Error:** `could not connect to server`
- Check PostgreSQL is running: `pg_ctl status`
- Verify DATABASE_URL in `.env`
- Check firewall/network settings

### Migration Errors

**Error:** `Target database is not up to date`
- Run: `alembic upgrade head`

**Error:** `Can't locate revision identified by 'xyz'`
- Check `alembic_version` table in database
- May need to manually fix or stamp version

### Model Changes Not Detected

- Ensure models are imported in `alembic/env.py`
- Run `alembic revision --autogenerate` after model changes
- Check for SQLAlchemy column type changes

---

## Best Practices

1. **Always use Alembic in production** - Don't use `init_db()`
2. **Review auto-generated migrations** - Alembic may miss some changes
3. **Add indexes** for frequently queried columns
4. **Use transactions** - Context manager handles this automatically
5. **Close sessions** - `get_db()` and `get_db_context()` handle this
6. **Validate JSON data** - Use Pydantic models before storing in JSON columns
7. **Set proper cascade rules** - Already configured in relationships
8. **Use enums for fixed values** - Like `JobStatus`

---

## Schema Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │◄─────┐
│ email           │      │
│ name            │      │
│ company_name    │      │
│ created_at      │      │
│ updated_at      │      │
└─────────────────┘      │
                         │
                         │ user_id (FK)
                         │
┌─────────────────────┐  │
│   AnalysisJobs      │  │
├─────────────────────┤  │
│ id (PK)             │──┘
│ user_id (FK)        │
│ status              │
│ progress            │
│ baseline_s3_key     │
│ renewal_s3_key      │
│ baseline_filename   │
│ renewal_filename    │
│ error_message       │
│ created_at          │
│ updated_at          │
│ started_at          │
│ completed_at        │
└─────────────────────┘
        │
        │ job_id (FK, one-to-one)
        │
        ▼
┌──────────────────────┐
│  AnalysisResults     │
├──────────────────────┤
│ job_id (PK, FK)      │
│ total_changes        │
│ change_categories    │ (JSON)
│ changes              │ (JSON)
│ premium_comparison   │ (JSON)
│ suggested_actions    │ (JSON)
│ educational_insights │ (JSON)
│ confidence_score     │
│ analysis_version     │
│ model_version        │
│ processing_time      │
│ created_at           │
└──────────────────────┘
```

