# CVBER — Product Requirements Document (PRD)

**Version:** 2.0  
**Last Updated:** February 13, 2026  
**Status:** Active Development  
**Owner:** Manoj  

---

## 1. Executive Summary

**CVBER** (pronounced "Cyber") is a full-stack, AI-powered cybersecurity platform purpose-built for **digital creators, artists, and content owners**. It provides an end-to-end solution for protecting, proving ownership of, and enforcing rights over digital creative work.

In an era where AI-generated content and digital piracy threaten creator livelihoods, CVBER combines cutting-edge AI threat analysis, C2PA digital provenance signatures, automated theft monitoring, and legal enforcement tooling into a single unified platform.

### Core Value Proposition

> **Protect. Prove. Enforce.**  
> Upload your work → Sign it with C2PA → Monitor the web → Auto-generate takedowns.

---

## 2. Problem Statement

Digital creators face an escalating set of threats:

| Problem | Impact |
|---------|--------|
| **AI-powered theft** | Generative AI makes it trivial to clone, remix, and redistribute creative work |
| **No proof of ownership** | Without provenance tracking, proving you are the original creator is expensive and difficult |
| **Manual enforcement** | Filing DMCA takedowns is tedious, platform-specific, and time-consuming |
| **Lack of monitoring** | Creators cannot realistically track where their content appears across the internet |
| **No embedded protection** | Stripped watermarks and missing metadata leave files defenseless once shared |

### Why Now?

- The C2PA standard (backed by Adobe, Microsoft, Google, and the BBC) is becoming the industry standard for content provenance
- AI art theft is at an all-time high, with creators losing revenue and control
- Platforms are increasingly requiring provenance metadata for content moderation

---

## 3. Target Users

### Primary Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Independent Digital Artist** | Creates illustrations, concept art, or graphic designs shared on social media and marketplaces | Prove originality, detect unauthorized AI training/remixing, generate takedowns |
| **Photographer** | Professional or semi-pro photographer selling prints or licensing work | Sign images with provenance, license to clients, monitor for unauthorized usage |
| **Content Creator** | YouTuber, TikToker, or Instagram creator producing original video/image content | Platform monitoring, kill switch for stolen content, DMCA automation |
| **NFT / Web3 Artist** | Digital artist minting and selling on-chain art | Prove originality before mint, prevent unauthorized minting by others |

### Secondary Personas

| Persona | Description |
|---------|-------------|
| **Stock Contributors** | Photographers/illustrators selling through stock platforms who need to track usage |
| **Creative Agencies** | Teams managing portfolios for multiple clients |
| **Brand Managers** | Protecting branded visual assets from misuse |

---

## 4. Feature Requirements

### 4.1 AI-Powered Threat Detection

**Priority:** P0 (Core)  
**Status:** ✅ Implemented  
**Backend:** `vertex_ai.py`  
**Frontend:** `FileUploader.tsx`, `FileViewer.tsx`

#### Description
Users upload a file, and CVBER's AI engine (powered by **Vertex AI / Gemini 3 Flash**) performs comprehensive security analysis.

#### Functional Requirements
- [x] File upload via drag-and-drop or file picker
- [x] AI analysis with detailed risk scoring (Low / Medium / High / Critical)
- [x] Detection of security vulnerabilities (malware, steganography, exploit code)
- [x] Originality assessment and plagiarism detection
- [x] Forensic analysis of file metadata, structure, and provenance
- [x] Display detailed findings with actionable recommendations
- [x] Scan history with filtered views

#### Non-Functional Requirements
- Analysis must complete within 30 seconds for files under 25MB
- AI responses must be human-readable, not raw model output
- Thinking level set to HIGH for comprehensive reasoning

---

### 4.2 C2PA Digital Authenticity Signatures

**Priority:** P0 (Core)  
**Status:** ✅ Implemented  
**Backend:** `c2pa_service.py` / C2PA microservice  
**Frontend:** `CertificateGenerator.tsx`

#### Description
Implements the **Content Authenticity Initiative (C2PA)** standard for digital content signing and verification.

#### Functional Requirements
- [x] Cryptographically sign files with provenance data
- [x] Verifiable digital certificates embedded in file metadata
- [x] Verification endpoint to check if content is authentic and unmodified
- [x] Tamper detection for altered files
- [x] Provenance chain tracking (edit history, ownership transfers)
- [x] Certificate generation with visual badge/QR code

#### Non-Functional Requirements
- Signing must use industry-recognized cryptographic standards
- Verification must be interoperable with other C2PA tools (Adobe, Microsoft)
- Signed files must remain valid across format conversions where possible

---

### 4.3 Secure Vault Storage

**Priority:** P0 (Core)  
**Status:** ✅ Implemented  
**Backend:** `storage.py`  
**Frontend:** `SafeVault.tsx`

#### Description
Encrypted, access-controlled storage for users' protected digital assets.

#### Functional Requirements
- [x] Grid/list view of all stored files with risk scores and status
- [x] Row Level Security (RLS) — users can only access their own files
- [x] File preview with detailed metadata view
- [x] Encrypted storage at rest via Supabase Storage buckets
- [x] Upload, download, and delete operations
- [x] Real-time threat status indicators per file

#### Non-Functional Requirements
- Storage leverages Supabase RLS policies for zero-trust access
- Files stored in `safe-vault` (private, encrypted) bucket
- Google Cloud KMS integration for key management

---

### 4.4 Metadata Injection (Digital ID)

**Priority:** P1 (High)  
**Status:** ✅ Implemented  
**Backend:** `metadata_engine.py`

#### Description
Embeds persistent ownership information directly inside file metadata.

#### Functional Requirements
- [x] EXIF metadata injection (creator name, copyright, timestamps)
- [x] IPTC field embedding (contact details, usage rights, terms of use)
- [x] Verification URL injection linking back to CVBER certificate
- [x] Batch metadata injection support
- [ ] XMP sidecar support for RAW files

---

### 4.5 Theft Monitoring & Detection

**Priority:** P1 (High)  
**Status:** ✅ Implemented  
**Backend:** `theft_monitor.py`  
**Frontend:** `TheftMonitor.tsx`

#### Description
Automated monitoring of the web and major platforms for unauthorized use of protected content.

#### Functional Requirements
- [x] Reverse image search integration
- [x] Platform monitoring (YouTube, Instagram, TikTok, X/Twitter, Facebook)
- [x] Real-time theft alert notifications
- [x] Revenue loss estimation per detected infringement
- [x] Infringer database for tracking repeat offenders
- [ ] Scheduled automated scans (daily/weekly)
- [ ] Email/push notification alerts

---

### 4.6 Kill Switch — Content Revocation

**Priority:** P1 (High)  
**Status:** ✅ Implemented  
**Backend:** `kill_switch.py`  
**Frontend:** `KillSwitch.tsx`

#### Description
Emergency content revocation mechanism for when theft is discovered.

#### Functional Requirements
- [x] Instantly revoke access to disputed content
- [x] Generate dispute banners for flagged content
- [x] Dispute resolution audit trail
- [x] Blur stolen content until disputes are resolved
- [ ] Automated platform notification on kill switch activation

---

### 4.7 Licensing Engine

**Priority:** P1 (High)  
**Status:** ✅ Implemented  
**Backend:** `licensing.py`  
**Frontend:** `LicenseGenerator.tsx`

#### Description
Professional digital licensing system with multiple license tiers.

#### Functional Requirements
- [x] Four license types: Personal, Commercial, Exclusive, Editorial
- [x] Unique verification URL per license
- [x] Embedded JSON-LD metadata in licensed files
- [x] License revocation capabilities
- [x] Automated expiration tracking and alerts
- [ ] Payment integration (Stripe) for license purchases
- [ ] Custom license terms builder

| License Type | Commercial Use | Modification | Distribution | Duration |
|--------------|:-:|:-:|:-:|----------|
| **Personal** | ❌ | ✅ | ❌ | Perpetual |
| **Commercial** | ✅ | ✅ | ✅ | 1 Year |
| **Exclusive** | ✅ | ✅ | ✅ | Perpetual |
| **Editorial** | ❌ | ❌ | ✅ | 30 Days |

---

### 4.8 DMCA Enforcement Automation

**Priority:** P1 (High)  
**Status:** ✅ Implemented  
**Backend:** `enforcement.py` (router + service)  
**Frontend:** `DMCAGenerator.tsx`

#### Description
Generates legally compliant DMCA takedown notices tailored to each platform.

#### Functional Requirements
- [x] Platform-specific templates (YouTube, Instagram/Meta, TikTok, X/Twitter)
- [x] Forensic evidence bundle generation (originality scores, C2PA verification links)
- [x] Pre-filled takedown forms with submission instructions
- [x] Takedown status tracking
- [ ] Direct API submission to platform takedown endpoints
- [ ] Legal review integration

---

### 4.9 AI Security Mentor (Chat)

**Priority:** P2 (Medium)  
**Status:** ✅ Implemented  
**Backend:** `mentor.py`, `vertex_ai.py`  
**Frontend:** `SecurityMentor.tsx`

#### Description
Interactive AI chat assistant that helps users understand and act on security findings.

#### Functional Requirements
- [x] Natural language explanations of security findings
- [x] Personalized recommendations for content protection
- [x] Guidance on copyright registration and legal options
- [x] Step-by-step enforcement process walkthrough
- [ ] Context-aware awareness of user's files and scan history
- [ ] Multi-turn conversation memory

---

### 4.10 Watermark Engine

**Priority:** P2 (Medium)  
**Status:** ✅ Implemented  
**Frontend:** `WatermarkEngine.tsx`

#### Description
Visual watermarking tool for adding visible protection to images.

#### Functional Requirements
- [x] Text and image watermark support
- [x] Position, opacity, and size controls
- [x] Batch watermarking
- [x] Preview before applying
- [ ] Invisible (steganographic) watermarking

---

### 4.11 Trust Score System

**Priority:** P2 (Medium)  
**Status:** ✅ Implemented  
**Backend:** `trust_score.py`  
**Frontend:** `TrustScoreBadge.tsx`

#### Description
Composite trust/reputation score for files based on multiple protection signals.

#### Functional Requirements
- [x] Aggregate score from C2PA signature, metadata, scan results
- [x] Visual badge for embedding or sharing
- [x] Score breakdown with contributing factors
- [ ] Public trust verification page for third parties

---

### 4.12 Blockchain Attestation

**Priority:** P3 (Low)  
**Status:** ✅ Implemented  
**Backend:** `blockchain.py`  
**Frontend:** `BlockchainStatus.tsx`

#### Description
On-chain attestation for additional immutable proof of ownership.

#### Functional Requirements
- [x] Hash-based attestation on-chain
- [x] Status display and verification
- [ ] Multi-chain support (Ethereum, Polygon, Solana)
- [ ] IPFS pinning for permanent storage

---

### 4.13 Screenshot Guard

**Priority:** P3 (Low)  
**Status:** ✅ Implemented  
**Frontend:** `ScreenshotGuard.tsx`

#### Description
Client-side deterrent against screenshot-based content theft.

#### Functional Requirements
- [x] DOM-level screenshot prevention measures
- [x] Right-click disable on protected content
- [ ] Screen recording detection

---

## 5. Technical Architecture

### 5.1 System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      FRONTEND                                 │
│           Next.js 15+ · TypeScript · Tailwind CSS             │
│        Supabase Auth · Glassmorphism Dark Theme UI            │
└────────────────────────────┬─────────────────────────────────┘
                             │ REST API
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND API                               │
│         Python FastAPI · JWT Auth · Rate Limiting             │
│    ┌──────────┐  ┌────────────┐  ┌─────────────────┐        │
│    │ Routers  │  │  Services  │  │  External APIs   │        │
│    │ auth     │  │ vertex_ai  │  │  Vertex AI       │        │
│    │ scan     │  │ storage    │  │  Google KMS      │        │
│    │ enforce  │  │ licensing  │  │  Supabase        │        │
│    │ mentor   │  │ kill_switch│  │                   │        │
│    └──────────┘  │ metadata   │  └─────────────────┘        │
│                  │ theft_mon  │                               │
│                  │ blockchain │                               │
│                  │ trust_score│                               │
│                  └────────────┘                               │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                   C2PA MICROSERVICE                           │
│      Node.js · Express · @contentauth/c2pa-node              │
│          POST /sign  ·  POST /verify  ·  GET /health         │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                      DATABASE                                 │
│       Supabase (PostgreSQL) · Row Level Security             │
│  ┌───────────┐  ┌───────────────┐  ┌───────────────────┐    │
│  │ profiles  │  │ audit_logs    │  │ verification_meta │    │
│  └───────────┘  └───────────────┘  └───────────────────┘    │
│              Encrypted Storage Buckets                        │
│       safe-vault (private)  ·  scan-results (private)        │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15+, TypeScript, Tailwind CSS | App Router, SSR, responsive dark-themed UI |
| **Backend** | Python FastAPI | REST API, business logic, AI orchestration |
| **AI** | Google Vertex AI (Gemini 3 Flash) | Threat analysis, security mentoring, originality scoring |
| **C2PA** | Node.js + @contentauth/c2pa-node | Digital signing & verification microservice |
| **Database** | Supabase (PostgreSQL) | User data, audit logs, verification records with RLS |
| **Storage** | Supabase Storage | Encrypted file storage buckets |
| **Auth** | Supabase Auth + JWT | Email/password, Google OAuth |
| **KMS** | Google Cloud KMS | Cryptographic key management |
| **Deployment** | Vercel (frontend), Render (backend) | Production hosting |

### 5.3 API Surface

**Authentication:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login with email/password |
| GET | `/auth/me` | Get current user profile |

**Scanning & Protection:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/scan/` | Upload and AI-scan a file |
| POST | `/scan/verify` | Verify file C2PA signature |
| GET | `/scan/history` | Get scan history |

**C2PA Service:**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sign` | Sign file with C2PA |
| POST | `/verify` | Verify C2PA signature |
| GET | `/health` | Service health check |

---

## 6. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | AI scan < 30s for files ≤ 25MB; Page loads < 2s |
| **Security** | All data encrypted at rest and in transit; RLS on all tables; JWT + refresh tokens |
| **Scalability** | Stateless backend deployable to multiple instances |
| **Availability** | 99.9% uptime target for production |
| **Accessibility** | WCAG 2.1 AA compliance for all UI |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| **Mobile** | Responsive design for all screen sizes |

---

## 7. Deployment & Infrastructure

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | `https://cvber.vercel.app` |
| Backend API | Render | `https://cvber-api.onrender.com` |
| Database | Supabase | Managed PostgreSQL |
| C2PA Service | Render | Co-deployed with backend |

---

## 8. Roadmap

### Phase 1 — Foundation ✅ (Complete)
- [x] Authentication (email/password + Google OAuth)
- [x] AI threat detection with Vertex AI
- [x] C2PA digital signing and verification
- [x] Secure vault with encrypted storage
- [x] Dashboard with glassmorphism dark theme
- [x] Production deployment (Vercel + Render)

### Phase 2 — Protection Suite ✅ (Complete)
- [x] Metadata injection engine (EXIF + IPTC)
- [x] Theft monitoring and detection
- [x] Kill switch for content revocation
- [x] Licensing engine with 4 license types
- [x] DMCA takedown notice generator
- [x] Watermark engine
- [x] Trust score system
- [x] Blockchain attestation
- [x] Screenshot guard

### Phase 3 — Scale & Monetization (Planned)
- [ ] Stripe payment integration for license purchases
- [ ] Scheduled automated theft scans
- [ ] Email/push notification system
- [ ] Direct API submission to platform takedown endpoints
- [ ] Public trust verification pages
- [ ] API rate limiting and usage tiers

### Phase 4 — Expansion (Future)
- [ ] Mobile app (React Native)
- [ ] Team collaboration and multi-user workspaces
- [ ] Advanced analytics dashboard
- [ ] Webhook integrations for third-party tools
- [ ] Multi-chain blockchain support
- [ ] Invisible steganographic watermarking
- [ ] Custom license terms builder
- [ ] Legal review integration

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| **User Signups** | 1,000 in first 3 months |
| **Files Protected** | 10,000 C2PA-signed files in first 6 months |
| **Theft Detections** | > 90% detection rate for known test cases |
| **DMCA Generated** | 500 automated takedown notices in first 6 months |
| **User Retention** | 40% monthly active retention |
| **Scan Time** | Avg < 15 seconds per file |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|:--:|:--:|-------------|
| Vertex AI rate limits or cost overruns | Medium | High | Implement caching, usage quotas, and fallback models |
| C2PA adoption too slow for verification value | Medium | Medium | Add non-C2PA verification methods; educate users |
| Platform takedown API changes | High | Medium | Abstract platform integrations; monitor for breaking changes |
| False positives in AI threat detection | Medium | High | Human review option; confidence thresholds; feedback loop |
| Legal liability from DMCA generation | Low | High | Disclaimer that notices are templates; recommend legal review |

---

## 11. Appendix

### Glossary

| Term | Definition |
|------|-----------|
| **C2PA** | Coalition for Content Provenance and Authenticity — an open standard for digital content provenance |
| **DMCA** | Digital Millennium Copyright Act — US law governing copyright takedown procedures |
| **RLS** | Row Level Security — database-level access control that restricts which rows a user can access |
| **KMS** | Key Management Service — cloud service for managing cryptographic keys |
| **EXIF** | Exchangeable Image File Format — metadata standard for images |
| **IPTC** | International Press Telecommunications Council — metadata standard for media files |

### References
- [C2PA Specification](https://c2pa.org/specifications/specifications/2.0/specs/C2PA_Specification.html)
- [Content Authenticity Initiative](https://contentauthenticity.org/)
- [DMCA Safe Harbor Provisions](https://www.copyright.gov/title17/92chap5.html)
