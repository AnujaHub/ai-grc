# AI Governance & Compliance Platform

A full-stack GRC (Governance, Risk & Compliance) platform for managing the compliance of Artificial Intelligence systems, aligned with the **ISO/IEC 42001** standard.

Built as part of a software engineering internship at **Keystone Groupe**.

---

## ✨ Overview

Organizations increasingly rely on AI systems, but governing them responsibly — managing risks, ensuring transparency, tracking compliance — is still often done manually (spreadsheets, Word documents, disconnected checklists).

This platform digitizes and automates the entire compliance lifecycle: from inventorying AI systems, running structured conformity assessments against a real-world AI governance checklist (21 chapters / 84 clauses derived from ISO/IEC 42001, ISO/IEC 23894 and the EU AI Act), to automatically calculating compliance scores, tracking risks, and generating professional audit reports — enriched with generative AI.

---

## 🚀 Key Features

### Core GRC workflow
- **Organizations & AI systems inventory** — register organizations and the AI systems they operate
- **Compliance assessments** — interactive questionnaire per clause, scoped either to a specific AI system or to the organization's overall AI governance
- **Automatic compliance scoring** — computed from clause-level responses (Conforme / Partiellement conforme / Non conforme / Non applicable)
- **Risk register** — configurable impact × probability matrix (3, 4, or 5 levels, customizable per organization), with automatic risk-level calculation
- **Corrective actions** — tracked per risk, with due dates and status
- **Evidence management** — upload, download, and delete supporting documents (PDF, Word, Excel, images) per clause response
- **Dashboard** — real-time KPIs, charts (risk distribution, compliance scores per system, non-conformities by department), filterable by organization
- **Audit trail** — full logging of sensitive actions (logins, creations, modifications) for traceability (restricted to Admins/Auditors)
- **PDF report generation** — professional 11-section compliance reports (executive summary, regulatory framework, risk mapping & criticality matrix, gap analysis, prioritized remediation plan, AI governance roadmap, KPIs, glossary, references...)

### AI-powered features (via Groq LLM API)
- 🤖 **Automated risk generation** — analyzes non-conformities from an assessment and suggests concrete risks + corrective actions
- 💬 **Context-aware compliance assistant** — an in-app chatbot that can answer questions about ISO/IEC 42001 and the real-time compliance state of a selected organization
- 📄 **AI-generated executive summaries** inside PDF reports
- 🔍 **Multimodal evidence analysis** — the AI reads the actual content of an uploaded PDF or image and verifies whether it genuinely supports the declared compliance response (`Pertinente` / `Insuffisante` / `Non liée`)

### Access control & security
- **JWT authentication** with bcrypt password hashing
- **Role-Based Access Control (RBAC)** — Super Admin, Administrator, Compliance Officer, Auditor, Manager, each with scoped permissions
- **Multi-tenant scoping** — Super Admin sees all organizations; Administrators and other roles are scoped to their own organization's data

### UX details
- Custom design system ("auditor's ledger" visual identity — navy ink, muted emerald accent, serif/mono typography) built with Tailwind CSS
- Framer Motion micro-animations
- **"What if?" simulator** — instantly projects the compliance score impact of fixing selected non-conformities, before saving anything
- Priority actions widget on the dashboard, auto-ranked by risk level and due date

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Auth | JWT (python-jose) + bcrypt |
| PDF generation | ReportLab |
| AI / LLM | Groq API (`openai/gpt-oss-20b` for text, `qwen/qwen3.6-27b` for vision) |
| Frontend | React (Vite) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Charts | Recharts |
| HTTP client | Axios |
| Routing | React Router |

---

## 📁 Project Structure

```
grc-platform/
├── backend/
│   ├── main.py                    # FastAPI entry point, routers, CORS
│   ├── database.py                # SQLAlchemy engine & session
│   ├── security.py                # Password hashing, JWT, RBAC dependency
│   ├── scope.py                   # Multi-tenant organization scoping
│   ├── groq_service.py            # All Groq LLM integrations
│   ├── rapport_service.py         # PDF report generation (ReportLab)
│   ├── audit_logger.py            # Audit trail helper
│   ├── seed_referentiel.py        # Seeds ISO/IEC 42001 checklist data
│   ├── models/                    # SQLAlchemy models (one per entity)
│   ├── schemas/                   # Pydantic schemas
│   └── routers/                   # API route modules
└── frontend/
    └── src/
        ├── pages/                 # One component per screen
        ├── components/            # Reusable UI components
        ├── services/              # Axios API clients
        └── utils/                 # Role/permission helpers
```

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.11+
- Node.js (LTS)
- PostgreSQL
- A [Groq API key](https://console.groq.com) (free tier available)

### Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/grc_platform
GROQ_API_KEY=your_groq_api_key
```

Create the PostgreSQL database (`grc_platform`), then:

```bash
python create_tables.py
python seed_referentiel.py     # loads the ISO/IEC 42001 checklist (21 chapters, 84 clauses)
uvicorn main:app --reload
```

Backend runs on `http://127.0.0.1:8000` — interactive API docs at `http://127.0.0.1:8000/docs`.

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### First use

1. Register a user via `POST /auth/register` (Swagger UI) — use `"role": "super_admin"` for the first account
2. Log in via the frontend
3. Create an organization, an AI system, and start your first assessment

---

## 🗺️ Roadmap / Possible Evolutions

- [ ] Single Sign-On (SSO)
- [ ] Support for additional frameworks (ISO/IEC 27001, NIST AI RMF)
- [ ] Full multi-tenant data isolation for a production SaaS deployment
- [ ] Dockerized deployment
- [ ] Automated test suite (unit & integration tests)
- [ ] Email notifications for overdue actions

---

## 📄 License

This project was developed for academic/internship purposes. License terms to be defined by the project owner.

---

## 🙏 Acknowledgements

Developed by **Issra Akrout** during a software engineering internship at **Keystone Groupe**, under the guidance of Mr. Haythem L'Mir and Mr. Ramzi Khiari, with the support of the GRC team.
