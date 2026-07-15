# Architecture

## Overview

CVBER is a free, open-source AI-powered copyright protection platform. It helps digital creators detect theft, prove ownership, and generate DMCA-ready evidence.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 18, TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| AI | Groq (primary), NVIDIA NIM (deep search) |
| C2PA | Node.js microservice |
| Deployment | Vercel (frontend), Render (backend) |

## Monorepo Structure

```
cvber/
├── frontend/          # Next.js 15 App Router
├── backend/           # Python FastAPI
├── c2pa-service/      # Node.js C2PA microservice
├── supabase/          # Database migrations
├── docs/              # Documentation
├── demo/              # Sample assets and outputs
└── .github/           # CI workflows, issue templates
```

## Data Flow

```
User Upload
   ↓
File Processing (hashing, metadata extraction)
   ↓
Watermark / Metadata / Perceptual Hashing
   ↓
Reverse Image Search (5 engines)
   ↓
Evidence Record (timestamp, hash, search results)
   ↓
Evidence ZIP Download
   ↓
Dashboard + DMCA Workflow
```

## Backend Endpoints (54 total)

| Category | Endpoints | Description |
|----------|-----------|-------------|
| Auth | 6 | Registration, login, profile |
| Vault | 4 | Encrypted storage, CRUD |
| Scan | 4 | Upload, analyze, history |
| Search | 3 | Reverse image search, deep search |
| Evidence | 4 | PDF, ZIP, certificates |
| Blockchain | 3 | Bitcoin OP_RETURN timestamps |
| C2PA | 3 | Sign, verify, status |
| Watermark | 2 | Embed, extract |
| DMCA | 4 | Generate, templates, track |
| AI Agent | 3 | Chat, tools, self-improve |
| AI Analysis | 4 | Style DNA, theft prediction, authentication |
| Security | 3 | Mentor, threat detection |

## Security Model

- **Row Level Security (RLS)** on all Supabase tables
- **JWT authentication** with short-lived tokens
- **File validation** by type and size
- **No secrets in code** — all credentials in environment variables
- **Mock mode** for development without API keys

## Frontend Pages (39+)

- Landing page, dashboard, vault, scan, search
- Evidence viewer, DMCA workflow
- AI security mentor
- 8 SEO-optimized blog posts
- Feature comparison pages
- About page
