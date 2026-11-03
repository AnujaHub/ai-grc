# AI GRC Platform

AI GRC Platform is a full-stack Governance, Risk, and Compliance application for managing artificial intelligence systems. It supports AI-system inventory, ISO/IEC 42001 assessments, risk tracking, corrective actions, evidence, audit logs, and PDF reports.

## Features

- Organization and AI-system inventory
- ISO/IEC 42001 assessment workflow
- Compliance scoring
- Risk register with configurable impact and probability levels
- Corrective-action tracking
- Evidence upload and management
- Dashboard metrics and priority actions
- Audit log
- PDF compliance reports
- Optional Groq-powered chatbot, risk suggestions, evidence analysis, and report summaries
- JWT authentication and role-based access control

## Technology

- Backend: Python, FastAPI, SQLAlchemy
- Database: PostgreSQL
- Frontend: React, Vite, Tailwind CSS
- Authentication: JWT and bcrypt
- Reports: ReportLab
- AI features: Groq API

## Requirements

- Python 3.11 or newer
- Node.js LTS and npm
- PostgreSQL
- A Groq API key for AI-powered features

## Backend setup on Windows

Open PowerShell in the project folder:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

If PowerShell prevents virtual-environment activation, run this once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Create `backend\.env` locally. Do not commit this file:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/grc_platform
GROQ_API_KEY=your_groq_api_key
```

Create a PostgreSQL database named `grc_platform`, then initialize the tables and reference framework:

```powershell
python create_tables.py
python seed_referentiel.py
```

Start the backend:

```powershell
uvicorn main:app --reload
```

The backend runs at:

- API: http://127.0.0.1:8000
- Health check: http://127.0.0.1:8000/health
- Swagger documentation: http://127.0.0.1:8000/docs

## Frontend setup

Open a second PowerShell window:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## First use

1. Open the Swagger page at http://127.0.0.1:8000/docs.
2. Register the first user with the `super_admin` role using `POST /auth/register`.
3. Open http://localhost:5173 and log in.
4. Create an organization.
5. Register an AI system.
6. Start an organization-wide or AI-system assessment.
7. Answer assessment clauses and save responses.
8. Complete the assessment to calculate the compliance score.
9. Create risks and corrective actions.
10. Generate a PDF report.

## Important security notes

- Never commit `backend\.env`.
- Never publish PostgreSQL passwords or Groq API keys.
- The database, virtual environment, installed packages, and local user accounts are not stored in Git.
- Create a new `.env` file on every machine where the project is installed.

## Useful commands

Build the frontend:

```powershell
cd frontend
npm run build
```

Check the backend:

```powershell
Invoke-WebRequest http://127.0.0.1:8000/health
```

Stop either development server with `Ctrl+C`.

## Project structure

```text
AI-GRC-Platform/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── security.py
│   ├── models/
│   ├── schemas/
│   └── routers/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       └── utils/
└── README.md
```
