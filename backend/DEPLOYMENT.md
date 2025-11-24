# Deployment Guide - Render.com

Complete guide for deploying the Prisere Insurance Comparison API to Render.com.

---

## 📋 Prerequisites

Before deploying, ensure you have:

### 1. **Render Account**
- Sign up at https://render.com
- Free tier available for testing

### 2. **GitHub Repository**
- Code pushed to GitHub
- Repository connected to Render

### 3. **API Keys & Credentials**
Gather these before starting:
- ✅ AWS Access Key ID & Secret Access Key
- ✅ AWS S3 Bucket Name (created and configured)
- ✅ Anthropic API Key (from console.anthropic.com)
- ✅ Clerk Secret Key & Publishable Key (from dashboard.clerk.com)

### 4. **AWS S3 Bucket Configuration**
Your S3 bucket must be configured with:
- **Bucket name**: e.g., `prisere-policies` or `insurance-policies-temp`
- **Region**: e.g., `us-east-1`
- **CORS enabled**: Allow your frontend and backend URLs
- **Lifecycle rule**: Auto-delete files after 1 day (optional but recommended)

#### S3 CORS Configuration
Add this to your S3 bucket CORS settings:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
    "AllowedOrigins": [
      "https://your-backend.onrender.com",
      "https://your-frontend.vercel.app"
    ],
    "ExposeHeaders": ["ETag"]
  }
]
```

#### S3 Lifecycle Rule (Optional)
1. Go to S3 bucket → Management → Lifecycle rules
2. Create rule: "Delete files after 1 day"
3. Scope: Prefix = `uploads/`
4. Action: Expire current versions after 1 day

---

## 🚀 Deployment Steps

### Step 1: Prepare Your Repository

Ensure your repository has these files:
```
backend/
├── render.yaml          ← Deployment configuration (created)
├── requirements.txt     ← Python dependencies
├── alembic.ini          ← Alembic configuration
├── alembic/
│   └── versions/        ← Database migrations
├── app/
│   └── main.py          ← FastAPI application
└── .gitignore           ← Don't commit .env!
```

**Important**: Never commit `.env` to GitHub! Use `.gitignore`:
```gitignore
.env
.env.local
*.pyc
__pycache__/
venv/
```

---

### Step 2: Create PostgreSQL Database on Render

1. **Log in to Render Dashboard**
   - Go to https://dashboard.render.com

2. **Create New PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - **Name**: `prisere-database`
   - **Database**: `prisere`
   - **User**: `prisere_user` (auto-generated)
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
   - **Plan**: Starter (Free) for testing, Standard for production
   - Click "Create Database"

3. **Save Connection Details**
   - Render will show:
     - Internal Database URL (for your web service)
     - External Database URL (for local testing)
   - Copy these for later use

4. **Wait for Database to Provision**
   - Takes 1-2 minutes
   - Status will show "Available" when ready

---

### Step 3: Create Web Service on Render

1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - **Connect Repository**: Select your GitHub repo
   - **Select Branch**: `main` (or your deployment branch)

2. **Configure Basic Settings**
   - **Name**: `prisere-backend` (or your preferred name)
   - **Region**: Same as database (lower latency)
   - **Branch**: `main`
   - **Root Directory**: `backend` (if backend is in subdirectory)
   - **Runtime**: Python 3

3. **Configure Build & Start Commands**
   - **Build Command**:
     ```bash
     pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
     ```
   
   - **Start Command**:
     ```bash
     uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```

4. **Plan Selection**
   - **Free**: For testing (services spin down after 15 min inactivity)
   - **Starter ($7/mo)**: Always on, 512MB RAM
   - **Standard ($25/mo)**: 2GB RAM, better performance

5. **Advanced Settings**
   - **Health Check Path**: `/health`
   - **Auto-Deploy**: Yes (deploys on git push)

---

### Step 4: Configure Environment Variables

In Render Dashboard → Your Web Service → Environment:

#### Application Settings
| Variable | Value | Notes |
|----------|-------|-------|
| `PYTHON_VERSION` | `3.11.0` | Python runtime version |
| `ENVIRONMENT` | `production` | Environment mode |
| `PORT` | `3001` | Service port (or use Render's default) |
| `LOG_LEVEL` | `INFO` | Logging level (INFO for production) |
| `ALLOWED_ORIGINS` | `https://your-frontend.vercel.app,https://your-domain.com` | Frontend URLs (comma-separated) |

#### Database
| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | From database connection string | Copy from database info page |

**Tip**: Render can auto-link databases. If you used the `render.yaml`, it will auto-populate `DATABASE_URL`.

#### AWS S3
| Variable | Value | Notes |
|----------|-------|-------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key | From AWS IAM |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key | **Keep secret!** |
| `AWS_S3_BUCKET_NAME` | `your-bucket-name` | Your S3 bucket name |
| `AWS_REGION` | `us-east-1` | Your S3 bucket region |

#### Clerk Authentication
| Variable | Value | Notes |
|----------|-------|-------|
| `CLERK_SECRET_KEY` | `sk_live_...` or `sk_test_...` | From Clerk dashboard |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` or `pk_test_...` | From Clerk dashboard |

#### Anthropic Claude
| Variable | Value | Notes |
|----------|-------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | From console.anthropic.com |
| `ANTHROPIC_MODEL` | `claude-3-haiku-20240307` | Use Haiku (cheaper) or Sonnet (better) |

#### File Upload Settings (Optional)
| Variable | Value | Notes |
|----------|-------|-------|
| `MAX_FILE_SIZE_MB` | `25` | Max PDF size (MB) |
| `ALLOWED_FILE_TYPES` | `application/pdf` | Allowed MIME types |
| `JOB_TIMEOUT_SECONDS` | `120` | Analysis timeout |
| `PDF_RETENTION_HOURS` | `24` | How long to keep PDFs |
| `RESULTS_RETENTION_DAYS` | `365` | How long to keep results |

---

### Step 5: Run Database Migrations

After the service deploys, you need to run migrations:

#### Option A: Using Render Shell (Recommended)

1. Go to Render Dashboard → Your Web Service
2. Click "Shell" tab
3. Run migration command:
   ```bash
   alembic upgrade head
   ```
4. Verify success:
   ```bash
   alembic current
   ```

#### Option B: Add to Build Command

Update your Build Command to include migrations:
```bash
pip install --upgrade pip setuptools wheel && pip install -r requirements.txt && alembic upgrade head
```

**Warning**: This runs migrations on every deploy, which is safe but may slow down deployments.

#### Option C: Manual Pre-Deploy Script

Create `scripts/render_deploy.sh`:
```bash
#!/bin/bash
set -e

echo "Installing dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

echo "Running database migrations..."
alembic upgrade head

echo "Deployment preparation complete!"
```

Update Build Command to:
```bash
bash scripts/render_deploy.sh
```

---

### Step 6: Deploy & Verify

1. **Trigger Deployment**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or push to GitHub (auto-deploys if enabled)

2. **Monitor Deployment**
   - Watch the Logs tab for build progress
   - Look for:
     ```
     Installing dependencies...
     Successfully installed fastapi-0.104.1 ...
     Starting uvicorn...
     Uvicorn running on http://0.0.0.0:3001
     ```

3. **Verify Health Check**
   - Once deployed, visit:
     ```
     https://your-service-name.onrender.com/health
     ```
   - Should return:
     ```json
     {
       "status": "healthy",
       "service": "prisere-api",
       "version": "1.0.0",
       "environment": "production"
     }
     ```

4. **Check API Documentation**
   - Development docs are disabled in production
   - Verify endpoints work via API testing tool (Postman, Thunder Client)

---

## 🧪 Testing Your Deployment

### Test 1: Health Check
```bash
curl https://your-service.onrender.com/health
```

**Expected**: `200 OK` with JSON response

### Test 2: Database Connection
Check the logs for database connection messages:
```
INFO - Prisere API Starting...
INFO - Environment: production
```

No database errors should appear.

### Test 3: File Upload (with valid Clerk token)
```bash
curl -X POST https://your-service.onrender.com/v1/uploads/init \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.pdf", "file_type": "application/pdf"}'
```

**Expected**: Presigned S3 URL response

### Test 4: End-to-End Analysis
1. Upload two test PDFs via your frontend
2. Create analysis job
3. Monitor progress
4. Verify results are returned

---

## 🔧 Post-Deployment Configuration

### 1. Update Frontend Environment Variables

In your frontend (Vercel/local):
```env
NEXT_PUBLIC_API_URL=https://your-service.onrender.com/api/v1
```

### 2. Update CORS Settings

Ensure backend `ALLOWED_ORIGINS` includes your frontend URL:
```env
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://yourdomain.com
```

### 3. Configure Clerk Redirect URLs

In Clerk Dashboard → Paths:
- Add your production URL to allowed redirect URLs
- Update webhook endpoints if using webhooks

### 4. Set Up Monitoring

Render provides built-in monitoring:
- **Metrics**: CPU, Memory, Response time
- **Logs**: Application logs with search
- **Alerts**: Set up email alerts for downtime

---

## 📊 Monitoring & Logs

### View Logs
1. Go to Render Dashboard → Your Service
2. Click "Logs" tab
3. Filter by:
   - Time range
   - Log level (INFO, ERROR, etc.)
   - Search keywords

### Download Logs
```bash
# Using Render CLI
render logs -s your-service-name --tail 1000
```

### Application Logs Location
Logs are stored in `backend/logs/prisere_YYYYMMDD.log` but **only in memory** on Render. Use Render's logs viewer.

### Common Log Searches
- **Errors**: Search for `ERROR`
- **Analysis jobs**: Search for `Creating analysis job`
- **Claude API calls**: Search for `Claude`
- **Database issues**: Search for `psycopg2`

---

## 🐛 Troubleshooting

### Issue 1: "Application failed to start"

**Check**:
- Build logs for Python dependency errors
- Verify `requirements.txt` is correct
- Check Start Command is correct: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Solution**:
```bash
# Test locally first
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 3001
```

### Issue 2: "Database connection failed"

**Symptoms**:
```
psycopg2.OperationalError: could not translate host name
```

**Solution**:
- Verify `DATABASE_URL` is set correctly
- Use **Internal Database URL** (not external)
- Check database is in "Available" state

### Issue 3: "S3 Access Denied"

**Symptoms**:
```
botocore.exceptions.ClientError: Access Denied
```

**Solution**:
- Verify AWS credentials are correct
- Check IAM permissions for S3 bucket
- Ensure bucket name is correct
- Verify bucket region matches `AWS_REGION`

### Issue 4: "Claude API Error"

**Symptoms**:
```
anthropic.APIError: 401 Unauthorized
```

**Solution**:
- Verify `ANTHROPIC_API_KEY` is correct
- Check API key is active in Anthropic console
- Verify billing/usage limits

### Issue 5: "Clerk Authentication Failed"

**Symptoms**:
```
401 Unauthorized on protected endpoints
```

**Solution**:
- Verify `CLERK_SECRET_KEY` is correct
- Check Clerk publishable key matches frontend
- Verify JWT is being sent in Authorization header

### Issue 6: "Health check failing"

**Solution**:
- Verify `/health` endpoint returns 200 OK
- Check service is listening on `$PORT`
- Review startup logs for errors

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

Render automatically deploys when you push to your main branch.

**Workflow**:
1. Commit changes locally
   ```bash
   git add .
   git commit -m "Update feature X"
   git push origin main
   ```

2. Render detects push and starts build
3. Build runs: `pip install -r requirements.txt`
4. Tests run (if configured)
5. Old version kept running until new version is ready
6. New version deployed
7. Health check verified
8. Traffic switched to new version

### Manual Deployment

In Render Dashboard:
1. Go to your Web Service
2. Click "Manual Deploy"
3. Select "Deploy latest commit" or specific commit

### Rollback to Previous Version

1. Go to Render Dashboard → Your Service
2. Click "Events" tab
3. Find previous successful deployment
4. Click "Rollback" next to that deployment

---

## 🎯 Production Best Practices

### 1. Use Environment-Specific Settings

Set `ENVIRONMENT=production` to:
- Disable debug mode
- Hide API docs (`/docs`, `/redoc`)
- Use production logging levels
- Enable security features

### 2. Set Appropriate Log Level

- **Development**: `DEBUG`
- **Staging**: `INFO`
- **Production**: `WARNING` or `ERROR`

### 3. Database Backups

Render automatically backs up PostgreSQL databases:
- **Starter plan**: Daily backups, 7-day retention
- **Standard plan**: Daily backups, 30-day retention
- **Pro plan**: Continuous backups, point-in-time recovery

### 4. Monitor Resource Usage

- Check CPU and memory usage in Metrics tab
- Upgrade plan if consistently near limits
- Set up alerts for high resource usage

### 5. Secrets Management

- **Never** commit secrets to Git
- Use Render environment variables for all secrets
- Rotate API keys periodically
- Use separate keys for dev/staging/production

### 6. HTTPS Only

Render automatically provides HTTPS with free SSL certificates.

### 7. Rate Limiting (TODO)

Consider adding rate limiting middleware to prevent abuse:
```python
# Future enhancement - add to app/main.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
```

---

## 📈 Scaling

### Vertical Scaling (More Resources)

Upgrade your Render plan:
- **Starter**: 512MB RAM, 0.5 CPU
- **Standard**: 2GB RAM, 1 CPU
- **Pro**: 4GB RAM, 2 CPU
- **Pro Plus**: 8GB RAM, 4 CPU

### Horizontal Scaling (More Instances)

Render doesn't support horizontal scaling on individual services. Options:
1. Use Render's **load balancer** (Enterprise plan)
2. Use **background workers** for heavy processing
3. Use **Redis** for job queuing (deploy separate Redis service)

### Database Scaling

1. Upgrade database plan
2. Enable connection pooling (already enabled via SQLAlchemy)
3. Add read replicas (higher plans)

---

## 💰 Cost Estimation

### Free Tier
- **Web Service**: Free (spins down after 15 min inactivity)
- **PostgreSQL**: Free (limited to 1GB storage)
- **Total**: $0/month

**Limitations**:
- Services spin down after inactivity
- Cold start time: ~30-60 seconds
- Not suitable for production

### Starter Tier
- **Web Service**: $7/month
- **PostgreSQL**: $7/month
- **Total**: $14/month

**Features**:
- Always on
- 512MB RAM
- Good for MVP/small apps

### Standard Tier (Recommended for Production)
- **Web Service**: $25/month
- **PostgreSQL**: $25/month
- **Total**: $50/month

**Features**:
- 2GB RAM
- Better performance
- 30-day database backups

### Additional Costs
- **AWS S3**: ~$1-5/month (depends on usage)
- **Anthropic Claude API**: Pay per token (varies)
- **Clerk**: Free for <10K MAU, $25/month beyond

**Estimated Total**: $15-75/month depending on tier and usage.

---

## 🔐 Security Checklist

Before going to production:

- [ ] All secrets stored in Render environment variables (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] HTTPS enforced (automatic on Render)
- [ ] CORS properly configured with specific origins
- [ ] API authentication enabled (Clerk)
- [ ] Database backups enabled
- [ ] S3 bucket access restricted to your backend
- [ ] S3 lifecycle rules configured (auto-delete old files)
- [ ] Error messages don't expose sensitive information
- [ ] Logging doesn't include passwords/tokens
- [ ] Rate limiting configured (TODO)
- [ ] Security headers added (TODO)

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Render Community**: https://community.render.com
- **Support**: https://render.com/support

---

## 🎉 Deployment Complete!

Your Prisere API should now be running on Render at:
```
https://your-service-name.onrender.com
```

Next steps:
1. ✅ Update frontend to use production API URL
2. ✅ Test end-to-end flow with real PDFs
3. ✅ Set up monitoring and alerts
4. ✅ Review logs for errors
5. ✅ Document your production URLs for your team

**Happy deploying! 🚀**

