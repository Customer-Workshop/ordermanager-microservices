# AI-Enabled Staffing & Onboarding Portal

An enterprise-grade staffing lifecycle management portal built to manage onboarding of ~700 team members across 5 locations. Features AI-powered candidate matching, role rubric management, SLA tracking, and semantic search — all powered by Claude (Anthropic) via Amazon Bedrock.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Material UI + Vite |
| Backend | Python 3.12 + FastAPI |
| Database | PostgreSQL 16 |
| AI | Claude (Anthropic) via Amazon Bedrock |
| Cloud | AWS |
| Auth | Infosys SSO (placeholder) |

## Project Structure

```
staffing-ai-portal/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # FastAPI route handlers
│   │   ├── core/                # Security, dependencies
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # AI, Auth, WMT services
│   │   ├── config.py            # Settings
│   │   ├── database.py          # DB connection
│   │   └── main.py              # FastAPI app
│   ├── alembic/                 # Database migrations
│   ├── seed_data.py             # Initial data loader
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # Layout, shared components
│   │   ├── pages/               # Dashboard, Requests, Candidates, etc.
│   │   ├── services/            # API client
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx              # Router + theme
│   │   └── main.tsx             # Entry point
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## Quick Start

### With Docker Compose

```bash
docker-compose up --build
```

- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://localhost:5173

### Manual Setup

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Seed Data:**
```bash
cd backend
python seed_data.py
```

## Key Features

- **Staffing Request Lifecycle**: Full lifecycle from WMT request ingestion through onboarding
- **Practice Unit Management**: Tag roles to organizational units (ADM, CIS, QES, etc.) with Unit Anchors
- **Role Rubrics**: Upload HTML rubrics with weighted scoring, pass-band thresholds, auto-reject rules, and specialist-friendly rules — rendered in real-time during interviews
- **SLA Management**: Upload SLA definitions as .xls/.xlsx files, track compliance
- **AI-Powered Features**: Candidate matching, resume parsing, interview question generation, SLA risk prediction
- **Semantic Search**: Natural language search across candidates, roles, and requests via vector embeddings
- **24-Month Rotation Tracking**: Mandatory candidate replacement pipeline management
- **Hybrid Work Compliance**: Track 3+ days/week in-office requirement
- **5-Location Support**: Richardson TX, Raleigh NC, Phoenix AZ (company) + Plano TX, Reston VA (client)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/dashboard/` | Dashboard summary stats |
| `CRUD /api/v1/staffing-requests/` | Staffing request lifecycle |
| `CRUD /api/v1/candidates/` | Candidate management |
| `CRUD /api/v1/roles/` | Role management with Practice Unit tagging |
| `CRUD /api/v1/practice-units/` | Practice Unit + Unit Anchor management |
| `CRUD /api/v1/rubrics/` | Rubric CRUD + HTML upload |
| `GET /api/v1/rubrics/{id}/html` | Render rubric HTML for interviewers |
| `CRUD /api/v1/sla/` | SLA definitions + XLS file upload |
| `CRUD /api/v1/interviews/` | Interview rounds + rubric-based feedback |
| `POST /api/v1/ai/semantic-search` | AI-powered semantic search |
| `POST /api/v1/ai/match-candidate` | AI candidate-role matching |
| `POST /api/v1/auth/login` | Authentication |

## Phases

This is **Phase 1 (Foundation)**. Upcoming phases:
- Phase 2: AI-Powered Matching & Resume Parsing
- Phase 3: Interview & Offer Management
- Phase 4: Onboarding & Compliance
- Phase 5: Advanced AI & Analytics
- Phase 6: Hardening & Go-Live
