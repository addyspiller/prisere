# Prisere Insurance Renewal Comparison Tool

A web application that helps small business owners understand changes in their insurance policy renewals through AI-powered analysis and plain-language explanations.

## 🎯 Project Goal

Translate complex insurance policy changes into clear, actionable insights so SMBs can make informed coverage decisions and avoid being underinsured or overpaying.

## 📁 Documentation

- [Frontend PRD](./docs/frontend-prd.md) - Detailed product requirements for the frontend application
- [Backend PRD](./docs/backend-prd.md) - Technical specifications for the backend API service  
- [API Integration Guide](./docs/api-integration.md) - Contract between frontend and backend teams
- [Brand Guidelines](./docs/brand-guidelines.md) - Visual design and branding requirements

## 🏗 Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Next.js 14     │────▶│  FastAPI         │────▶│  Claude API     │
│  Frontend       │     │  Backend         │     │  (AI Analysis)  │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         
         │                       ▼                         
         │              ┌──────────────────┐              
         │              │                  │              
         └─────────────▶│  AWS S3          │              
                        │  (Temp Storage)  │              
                        │                  │              
                        └──────────────────┘              
```

## 🚀 Key Features

- **Secure PDF Upload**: Direct browser-to-S3 uploads for privacy
- **AI-Powered Analysis**: Claude 3.5 compares policies and identifies changes
- **R/Y/G Risk Classification**: Visual indicators for change severity
- **Plain-Language Explanations**: Complex insurance terms translated to simple English
- **Broker Questions**: Automated generation of questions to ask your insurance broker
- **Result History**: View past comparisons (results stored for 12 months)

## 🛠 Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- Tailwind CSS + shadcn/ui
- Clerk Authentication
- React Query for server state
- Hosted on Vercel

### Backend
- Python 3.11+ with FastAPI
- PostgreSQL database
- AWS S3 for temporary file storage
- Claude API for AI analysis
- Hosted on Render

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- AWS account (for S3)
- Clerk account (for auth)
- Claude API key

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure environment variables
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configure environment variables
uvicorn main:app --reload
```

## 🔒 Security & Privacy

- PDFs are encrypted in transit and at rest
- Files are automatically deleted after processing (max 24h)
- No long-term storage of policy documents
- GDPR-compliant with user data deletion rights
- All API endpoints require authentication

## 📊 Success Metrics

- ≥80% of users complete full analysis session
- <10% error rate
- Average processing time <90 seconds
- User engagement and repeat usage

## 🤝 Team Structure

- **Frontend Team**: Responsible for UI/UX and web application
- **Backend/AI Team**: Responsible for API, AI integration, and data processing
- Both teams work concurrently with defined API contracts

## 📝 License

Proprietary - Prisere Insurance Services

## 🔗 Resources

- [Prisere Website](https://prisere.com)
- [Brand Guidelines PDF](https://prisere.com/wp-content/uploads/2024/07/Prisere-Brand-Guideline.pdf)
- Internal Slack: #insurance-comparison-tool