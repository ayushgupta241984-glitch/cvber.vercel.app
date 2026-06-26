# CVBER

Free art-protection platform for digital creators.

**Live app:** https://cvber.vercel.app/

## What it does

CVBER helps artists create timestamped, downloadable evidence packages for their work using provenance metadata, watermarking, hashing, and DMCA-ready documentation.

## Why it matters

Digital creators need simple tools to prove ownership, prepare takedowns, and protect their work from unauthorized reposting, scraping, and AI training use. Most existing tools are expensive, complicated, or incomplete. CVBER is free and covers the full lifecycle: **detect, prove, enforce**.

## Current features

- Artwork upload with SHA-256 hashing
- AI-powered risk analysis and originality scoring
- 5-engine reverse image search (Yandex, Bing, Google Lens, TinEye, SauceNAO)
- Invisible watermarking
- Evidence ZIP download (report, hash certificate, DMCA template)
- Creator dashboard with protection history
- DMCA takedown template generation
- C2PA provenance metadata (experimental)
- Bitcoin blockchain timestamping (experimental)

## Demo flow

1. Upload artwork to the vault
2. CVBER analyzes risk and generates a protection record
3. Reverse image search scans for copies online
4. Download an evidence ZIP with everything needed for a DMCA
5. View protection status from the dashboard

## Screenshots

Screenshots coming soon. See `docs/screenshots/` for what will be added.

## Architecture

```
frontend/       Next.js 15 + React 18 + TypeScript + Tailwind CSS
backend/        Python FastAPI (54 API endpoints)
c2pa-service/   Node.js C2PA microservice
supabase/       PostgreSQL database migrations
```

**Deployment:** Vercel (frontend) + Render (backend)

**AI providers:** Groq (primary), NVIDIA NIM (deep search) — app works in mock mode without keys.

**Database:** Supabase (PostgreSQL + Storage + Auth)

See `docs/architecture.md` for full details.

## Local development

### Requirements

- Node.js 20+
- Python 3.10+
- npm

### Install

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && pip install -r requirements.txt
```

### Run locally

```bash
# Backend
cd backend
python -m uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm run dev
```

Open http://localhost:3000. The app works with mock data by default.

### Build

```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Test

```bash
# Backend
cd backend
PYTHONPATH=. python -m pytest tests/ -v
```

## Environment variables

See `.env.example` for all required and optional variables.

**Required:**
- `JWT_SECRET` — Random string for authentication

**Optional (app works in mock mode without these):**
- `GROQ_API_KEY` — Groq API for AI analysis
- `GOOGLE_API_KEY` — Google AI for style analysis
- `NVIDIA_NIM_API_KEY` — NVIDIA for deep image search
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — Database

Do not commit real secrets. Use `.env.local` for local development.

## Verification

Before pushing, run:

```bash
# Frontend
cd frontend && npm run lint && npm run build

# Backend
cd backend && PYTHONPATH=. python -m pytest tests/ -v
```

## Roadmap

### Now
- Stabilize upload and evidence generation
- Add monitoring workflow
- Get 50 real users
- Techstars NYC application

### Next
- Improve C2PA verification reliability
- Add creator feedback loop
- Add basic usage analytics

### Later
- Rights transfer workflow
- Team accounts for studios
- Mobile app

See `docs/roadmap.md` for full details.

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/architecture.md) | Tech stack, folder structure, data flow |
| [Evidence Pipeline](docs/evidence-pipeline.md) | How evidence is collected and packaged |
| [DMCA Workflow](docs/dmca-workflow.md) | How DMCA takedowns work |
| [C2PA Integration](docs/c2pa-integration.md) | C2PA status and limitations |
| [Security Model](docs/security-model.md) | Auth, data protection, known limitations |
| [Roadmap](docs/roadmap.md) | Product roadmap |

## AI-assisted development

CVBER was built with heavy use of coding agents including Claude Code and Codex. I used agents for implementation, debugging, refactoring, and deployment troubleshooting, while personally owning product direction, architecture, acceptance criteria, and QA.

For major changes I use:
1. Written target files and acceptance criteria
2. Local build/typecheck verification
3. Manual UI verification
4. Diff review before push

## Legal note

CVBER helps creators organize technical evidence and generate DMCA-ready materials. It is not a law firm and does not provide legal advice. C2PA metadata can be stripped by platforms. Blockchain timestamps prove existence, not authorship. CVBER combines multiple evidence layers for stronger protection, but no tool can guarantee legal outcomes.

## License

MIT — see [LICENSE](LICENSE).

## Founder

Built by Ayush Gupta, high-school founder and solo developer.
