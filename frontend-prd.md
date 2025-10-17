# Prisere Insurance Renewal Comparison Tool – Frontend PRD (v0)

## 1. Overview

**Product Name (Working Title):** Insurance Renewal Comparison Tool

**Goal:** Help small business owners understand when their renewal insurance policy no longer covers everything their previous plan did.

**Purpose:** Translate complex policy changes into plain-language insights so SMBs can make informed coverage decisions.

---

## 2. Problem & Opportunity

- Small businesses often renew insurance policies without realizing coverage has changed.
- Policy language is intentionally complex, and brokers' explanations are inconsistent.
- This creates hidden risk: SMBs may be **underinsured** or **overpaying for less coverage**.
- By simplifying renewal comparisons, Prisere can **build trust**, **educate SMBs**, and **strengthen resilience** before disasters occur.

---

## 3. Target Users

**Primary:** Retail SMB owners with limited insurance literacy

**Jobs to Be Done**
- "When my renewal arrives, I want to know what changed, in plain English."
- "I want to see if I'm losing coverage or paying more for less."
- "I want a checklist of what to ask my broker."

---

## 4. Core User Flow (v0)

### 1. Registration
- Inputs: Name, Email, Company Name
- Creates secure user session
- Optional: short onboarding explaining purpose of tool

### 2. Upload Policies
- Upload "Existing Policy" (baseline)
- Upload "Renewal Policy" (comparison)
- Supported file: PDF (≤10MB each)

### 3. Processing Screen
**Duration:** 90-120 seconds typical processing time

**Progressive Status Updates** (via WebSocket or polling):
- 🔍 Reading your current policy... (15%)
- 📄 Analyzing coverage sections... (35%)  
- 🔍 Reading your renewal policy... (50%)
- 📊 Comparing coverage changes... (75%)
- ✍️ Generating your report... (90%)
- ✅ Complete!

**Educational Content Carousel** (rotates every 15-20 seconds):
- 💡 "Deductibles are what you pay out-of-pocket before insurance kicks in. Higher deductibles = lower premiums"
- 🛡️ "Coverage limits are the maximum amount your insurer will pay for a claim"
- 📋 "Exclusions are specific situations or items your policy doesn't cover"
- 💰 "Premium changes often reflect changes in coverage or your business risk profile"
- 🏢 "General liability protects your business from customer injury or property damage claims"

**User Experience Features:**
- Users can close tab/browser and return to see results
- Job ID stored in user session for result retrieval
- Clear indication that processing continues in background
- Option to receive email notification when complete

### 4. Results Summary
- **Coverage Comparison Results** with factual changes detected
    - Coverage limits (previous vs. new amounts)
    - Deductible changes (previous vs. new amounts)
    - Coverage additions or removals
    - Exclusions or limitations modified
- **Educational Context** for each change type
    - What this type of change typically means
    - General implications (not specific advice)
- **Suggested Actions** checklist
    - Questions to ask your broker
    - Areas to review based on changes
- Option to download a summary PDF

### 5. Chatbot (FAQ)
- Static responses to common insurance questions
- Example topics: "What's a deductible?", "What does liability coverage mean?"

---

## 5. Functional Requirements

| Feature | Description | Notes |
| --- | --- | --- |
| Registration | Simple form with Name, Email, Company | Secure session handling |
| Policy Upload | Accept PDFs; temporary storage only | Delete after analysis |
| Policy Parsing | OCR + AI text extraction | Handle scanned docs |
| Change Detection | Identify and extract specific changes | Coverage amounts, deductibles, exclusions |
| Explanation Layer | Convert legalese → plain English | Factual descriptions of what changed |
| Educational Context | Provide general insurance education | Explain what types of changes typically mean |
| Processing Screen | Progressive status + educational carousel | Real-time updates via WebSocket/polling |
| Session Persistence | Job continues if user leaves/returns | Database-driven, tied to user account |
| Background Processing | Analysis runs independently of browser | Email notifications optional |
| Results Display | Structured comparison of changes | Factual before/after presentation |
| PDF Export | Download summary report | SMB-facing format |
| FAQ Chatbot | Static content only | Future: dynamic responses |

---

## 6. Non-Functional Requirements

### Privacy & Security
- No long-term data retention for PDFs
- Encrypt uploads during session
- Delete all files after output generated
- Results retained for 12 months (user can request deletion)

### Performance
- End-to-end analysis under 120 seconds
- Handle PDFs up to 25 pages per policy
- Consider email notifications for longer analyses

### Accuracy Goals
- ≥80% precision for clause matching in MVP
- Highlight confidence level (e.g., "We're 85% confident this section changed")

### Tone
- Educational and factual
- Neutral reporting of changes
- Empowering users with information
- Suggested actions phrased as "Consider asking..." or "You may want to review..."

### Cost Target
- ≤$1 per processed policy pair (Claude API or equivalent)

### Accessibility
- WCAG 2.1 AA standards
- Keyboard navigation, screen reader support
- Color indicators include text labels and icons
- Initial audit via axe-core plugin

### Responsive Design
- Fully responsive (min-width 360px)
- Mobile-optimized upload and results views
- No horizontal scroll
- Tested on Safari iOS, Chrome Android, Chrome desktop

---

## 7. Data Storage & Session Management

### Results Storage
- Results and short excerpts stored in PostgreSQL (backend managed)
- Users can view past comparison results when logging back in
- Policy PDFs are NOT stored; only extracted snippets and metadata
- Data retention: Results retained for 12 months (configurable)

### v0 Limitations
- Each session supports one comparison (baseline + renewal)
- Future: Multiple historical comparisons and trend views

---

## 8. AI Architecture & Integration

**Concurrent Development:** A separate team is building the AI engine for policy analysis.

### Integration Points
- AI component integrated at v0 launch
- Frontend team develops UX and application architecture
- Use mock data during development to simulate AI responses

### Assumed AI Capabilities
- Detects and extracts specific coverage differences
- Identifies change categories (limits, deductibles, exclusions, etc.)
- Generates factual descriptions of what changed
- Provides confidence scores for detected changes

### API Contract
- Input: S3 keys for two PDFs
- Output: Structured comparison data (changes, classifications, explanations)
- Version header: `x-api-version` for coordinated upgrades

---

## 9. Recommended Tech Stack

### Framework
- **Next.js 14 (App Router) + TypeScript**
- SSR/ISR for secure flows and fast loads
- API routes as thin adapters only

### UI & Styling
- **Tailwind CSS** for speed + consistency
- **shadcn/ui** component library (accessible, themeable)
- **Radix UI** primitives (focus management, a11y)
- **Lucide-react** icons

### Authentication
- **Clerk** (passwordless email or magic link)
- Frontend SDK for session, backend verification via FastAPI

### State Management
- **React Query** (TanStack Query) for server state
- Local component state only; no global state libs for v0

### Session Persistence & Background Processing
- **Database-Driven**: All job tracking stored in backend database, tied to user account
- **Return Experience**: Users can close tab during processing and return to see results
- **Polling Strategy**: Check job status every 5-10 seconds when tab is active
- **Email Notifications**: Optional email when analysis completes
- **Deep Linking**: Direct URLs to specific analysis results (`/analysis/{job_id}`)
- **Status Recovery**: On login/page load, fetch any in-progress jobs for the authenticated user

### File Upload Pattern
- Call `POST /v1/uploads/init` → receive pre-signed S3 PUT URLs
- Browser uploads PDFs directly to S3
- Send S3 keys back via `POST /v1/analyses`

### Monitoring & Analytics
- **Sentry** for error + performance monitoring
- **Plausible** or **PostHog** for privacy-safe analytics
- No PII tracking

### Hosting
- **Vercel**: env secrets, preview deployments, edge CDN

---

## 10. Success Metrics (v0 Pilot)

### Funnel Metrics
- ≥80% of users complete full analysis session
- <10% of sessions error out or time out
- Average processing <90 seconds

### Engagement Metrics
- % completing upload → analysis → result download
- Time-to-first-insight
- Device mix (desktop vs mobile)
- Number of repeat visits per user

### Analytics Tools
- Plausible/PostHog for user behavior
- Sentry for technical performance

---

## 11. MVP Scope (v0)

### In Scope
- Registration
- Upload two policies (existing + renewal)
- Factual coverage comparison display
- Educational context for change types
- Downloadable PDF report
- FAQ chatbot (static)
- Past results viewing

### Out of Scope (Future)
- Multi-policy comparisons in one session
- Storing policy history
- Integration with brokers or insurers
- Automatic renewal reminders
- Multi-user accounts
- QuickBooks/financial exposure linkage

---

## 12. Integration Path

This app will eventually connect to Prisere's larger platform for:
- Business Resilience Training
- Claims Support Tools
- Additional features

For v0, exists as a standalone front-end for early user feedback.

---

## 13. Legal & Privacy

### Legal Disclaimer
> "This tool provides automated detection and comparison of changes between your insurance policies. It reports factual differences found in the documents you upload and offers general educational information about insurance terms. This tool does not evaluate coverage adequacy, make recommendations, or provide legal or financial advice. The system analyzes only the two policy documents you upload. No external data, prior records, or third-party sources are used in the analysis. Always consult with your licensed insurance broker or provider to understand how these changes affect your specific business needs."

### Privacy Policy
- ✔️ We analyze **only the two policy PDFs you upload**
- 🔒 Files are encrypted in transit and deleted after processing
- 🧾 We store only the results and short excerpts for context
- ❌ We do **not** pull in any third-party or prior data