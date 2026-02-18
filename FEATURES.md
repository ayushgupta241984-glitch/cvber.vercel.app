# CVBER — Complete Feature Guide

> **Protect. Prove. Enforce.**

---

## What is CVBER?

**CVBER** (pronounced "Cyber") is a cybersecurity platform built specifically for **digital creators**. If you're a photographer, digital artist, content creator, or anyone who produces original visual work — CVBER gives you a full toolkit to protect it.

The problem is simple: your creative work gets stolen. Someone screenshots your art, re-uploads your photo, trains an AI on your portfolio, or reposts your video without credit. Proving you're the original creator is expensive and exhausting. Filing takedown notices is a manual nightmare. Monitoring where your content ends up across the internet? Nearly impossible.

**CVBER solves all of this in one place.** You upload your file, and the platform scans it, signs it with a cryptographic proof of ownership, monitors the internet for copies, and generates legal takedown notices when theft is detected — all from a single dashboard.

---

## How It Works (The Big Picture)

```
   ┌──────────┐      ┌─────────────┐      ┌──────────────┐      ┌────────────┐
   │  UPLOAD  │ ──→  │  AI SCANS   │ ──→  │  C2PA SIGNS  │ ──→  │  STORED IN │
   │ your file│      │ for threats  │      │ your file    │      │ Safe Vault │
   └──────────┘      └─────────────┘      └──────────────┘      └────────────┘
                                                                       │
                     ┌─────────────┐      ┌──────────────┐             │
                     │ DMCA auto-  │ ←──  │  THEFT IS    │ ←── MONITORED
                     │ generated   │      │  DETECTED    │     continuously
                     └─────────────┘      └──────────────┘
```

1. **Upload** your file (image, video, document)
2. **AI scans** it for security threats and assesses originality
3. **C2PA signs** it with an unforgeable digital certificate proving you're the creator
4. **Stored** in your encrypted Safe Vault with full access control
5. **Monitored** across YouTube, Instagram, TikTok, X, and the broader web
6. **Enforced** automatically with one-click DMCA takedown generation when theft is found

---

## Feature Breakdown

### 🔬 1. AI-Powered Threat Detection

**What it does:** When you upload a file, CVBER's AI engine performs a deep security analysis on it — checking for hidden threats, assessing how original the content is, and giving you a risk score.

**How it works under the hood:** The backend sends your file to **Google's Vertex AI (Gemini 3 Flash)** with the thinking level set to HIGH, meaning the AI reasons through its analysis step by step before responding. This isn't a simple "safe/unsafe" checker — it performs forensic-level inspection.

**What you see:**
- A **risk score** (Low, Medium, High, or Critical) displayed on a color-coded card
- A detailed **findings report** explaining what the AI found
- **Actionable recommendations** — specific steps you should take based on the results
- A persistent **scan history** so you can revisit past analyses

**What it detects:**
| Threat Type | Example |
|-------------|---------|
| Malware | Hidden executable code embedded inside an image |
| Steganography | Secret data concealed in pixel values |
| Plagiarism indicators | Signs that content may be derived from another source |
| Metadata anomalies | Suspicious or stripped EXIF data suggesting manipulation |

---

### 🔏 2. C2PA Digital Signing

**What it does:** Cryptographically signs your file with a **C2PA certificate** — the same standard used by Adobe, Microsoft, Google, and the BBC to prove content authenticity.

**Why it matters:** A C2PA signature is an unforgeable digital stamp embedded directly in your file. It records:
- **Who** created the content (you)
- **When** it was created (timestamp)
- **What** tool was used (CVBER)
- **Whether** it has been tampered with since signing

Anyone with a C2PA-compatible tool can verify your file is authentic and unmodified. This is becoming the global standard for content provenance, and having your files signed now puts you ahead of the curve.

**How it works under the hood:** A separate **Node.js microservice** running `@contentauth/c2pa-node` handles the actual cryptographic signing. When you click "Sign," your file is sent to this service, which embeds a C2PA manifest with your provenance data and returns the signed file.

**What you get:**
- A signed file with embedded provenance data
- A visual **certificate** you can share or embed
- A **verification link** anyone can use to confirm authenticity
- **Tamper detection** — if someone modifies your file after signing, verification fails

---

### 🏦 3. Safe Vault (Encrypted Storage)

**What it does:** A secure, encrypted storage space for all your protected files. Think of it as a bank vault for your digital assets.

**What you see:**
- A grid view of all your files with thumbnail previews
- Color-coded **status indicators** on each file:
  - 🟢 **Safe** — No threats detected
  - 🟡 **Warning** — Minor concerns found
  - 🔴 **Danger** — Significant threats detected
  - ⏳ **Scanning** — Analysis in progress
- **Risk scores** and **originality scores** displayed per file
- One-click actions: **View details**, **Apply watermark**, or **Delete**

**Security layers protecting your vault:**

| Layer | What It Does |
|-------|-------------|
| **Row Level Security (RLS)** | Database rules that physically prevent one user from accessing another user's files — enforced at the PostgreSQL level, not just in application code |
| **Encryption at rest** | All files encrypted using industry-standard algorithms in Supabase Storage |
| **Google Cloud KMS** | Cryptographic keys managed by Google's Key Management Service |
| **JWT Authentication** | Every API request requires a valid authentication token |

---

### 🪪 4. Metadata Injection (Digital ID)

**What it does:** Embeds your ownership information directly into your file's metadata — think of it as an invisible tattoo that survives even if someone strips your watermark.

**What gets embedded:**

| Metadata Standard | Fields Injected |
|-------------------|----------------|
| **EXIF** | Creator name, copyright notice, creation timestamp |
| **IPTC** | Contact details, usage rights, terms of use |
| **Custom** | CVBER verification URL linking back to your certificate |

**Why it matters:** Visible watermarks can be cropped or edited out. But metadata lives *inside* the file's binary data. When a platform or court examines the file, your ownership data is right there. It's passive, persistent protection that costs nothing once applied.

---

### 👁️ 5. Theft Monitoring (Watchtower)

**What it does:** Continuously scans the web and major platforms for unauthorized copies of your protected content.

**Platforms monitored:**
- 📺 **YouTube** — Video reposts and re-edits
- 📸 **Instagram** — Image theft and uncredited reposts
- 🎵 **TikTok** — Content ripping and re-uploads
- 🐦 **X (Twitter)** — Unauthorized sharing
- 🌐 **General Web** — Reverse image search across the internet

**What you see in the dashboard:**
- A live **alerts feed** with filterable tabs (All / New / Actioned)
- Each alert shows:
  - The **platform** where your content was found (with emoji icons)
  - A direct **link** to the infringing content
  - **Estimated views** the stolen content has received
  - **Estimated revenue loss** from the infringement
- A running total of your **estimated total revenue loss** at the top
- A **"Take Action"** button on each alert that launches the DMCA workflow

---

### 🔴 6. Kill Switch (Content Revocation)

**What it does:** An emergency button. When you discover theft, you flip the Kill Switch and your content is instantly locked down.

**What happens when activated:**
- All embeds and previews of the content are **blurred**
- A **"Content Under Dispute"** banner is displayed to anyone viewing it
- All sharing is **blocked**
- A **dispute ID** is generated for tracking
- A full **audit trail** records every action taken

**The interface:** A simple toggle switch. Off = dormant (gray). On = active protection (red). When active, you see real-time stats: **100% Content Blurred** and **∞ Shares Blocked**.

**When to use it:** The moment you discover large-scale theft or unauthorized commercial use of your work. It's the first response while you prepare a formal takedown.

---

### 📜 7. Licensing Engine

**What it does:** Creates professional digital licenses so you can legally authorize others to use your work — with full control over what they can and can't do.

**License types available:**

| Type | Price | Commercial Use | Can Modify | Can Redistribute | Duration |
|------|-------|:-:|:-:|:-:|----------|
| **Personal** | Free | ❌ | ✅ | ❌ | Perpetual |
| **Commercial** | $99 | ✅ | ✅ | ✅ | 1 Year |
| **Exclusive** | $499 | ✅ | ✅ | ✅ | Perpetual |
| **Editorial** | — | ❌ | ❌ | ✅ | 30 Days |

**What each license includes:**
- A **unique verification URL** that anyone can check
- **JSON-LD metadata** embedded in the file (machine-readable proof)
- **Revocation capability** — you can cancel a license at any time
- **Automated expiration tracking** — commercial and editorial licenses auto-expire

**How it works:** Select a file → choose the license type → click Generate. CVBER creates the license document, embeds the metadata, and gives you a shareable verification link.

---

### ⚖️ 8. DMCA Takedown Generator

**What it does:** Auto-generates legally compliant DMCA takedown notices, pre-formatted for each major platform.

**Supported platforms:**
- **YouTube** — Direct copyright form links and formatted legal text
- **Instagram / Meta** — Ready-to-submit takedown requests
- **TikTok** — Platform-specific templates
- **X (Twitter)** — Proper legal format with evidence

**What gets included in each notice:**
- Your **forensic evidence bundle** (scan results, originality scores)
- **C2PA signature verification links** proving you're the original creator
- **Digital timestamps** from when you first signed the content
- **Platform-specific submission instructions** so you know exactly where to send it

**How it works:** From the Theft Monitor, click "Take Action" on a detected infringement → select the platform → CVBER generates the complete DMCA notice. You can **copy to clipboard** with one click and paste it directly into the platform's takedown form.

The generator requires your asset's **name**, **hash**, **originality score**, and **forensic summary** — all of which are automatically populated from your earlier scan.

---

### 🤖 9. AI Security Mentor (Chat Assistant)

**What it does:** A real-time AI chat assistant that helps you understand your security findings and guides you through protecting your work.

**What you can ask it:**
- *"What does my risk score of 73 mean?"*
- *"How do I file a copyright registration with the US Copyright Office?"*
- *"Should I use a Commercial or Exclusive license for this client?"*
- *"Walk me through the DMCA process step by step."*

**How it works:** The chat is powered by the same Vertex AI backend as the threat scanner. It receives context about your dashboard state (how many files you have, their scan results) so its advice is personalized to your situation — not generic boilerplate.

**The interface:** A modern chat window with:
- Bot messages on the left (gray bubbles)
- Your messages on the right (blue bubbles)
- A live typing indicator when the AI is thinking
- Timestamped messages
- Error recovery if the connection drops

---

### 💧 10. Watermark Engine

**What it does:** A visual watermarking tool that overlays protective text or patterns on your images before sharing.

**Customization options:**
- **Text content** — Your name, brand, copyright notice, or any custom text
- **Position** — Place the watermark anywhere on the image
- **Opacity** — From subtle to bold
- **Size** — Adjustable to fit your content
- **Style** — Multiple watermark styles available
- **Color** — Choose from preset colors or custom palette
- **Pattern** — Single placement, tiled grid, or diagonal repeat

**How it works:** Upload an image (or select one from your vault) → customize the watermark settings → preview it live on a canvas → download the watermarked version. The watermark is rendered client-side using HTML Canvas, so your original file never leaves your browser during preview.

---

### 🏆 11. Trust Score (Creator Reputation)

**What it does:** Calculates a composite reputation score (out of 1,000) based on your protection activity, giving you a grade from **S** (Elite) to **D** (New).

**Score breakdown:**

| Factor | Max Points | What It Measures |
|--------|:--:|-----------------|
| **Originality** | 300 | Average originality scores from AI scans |
| **Upload History** | 200 | Consistency of uploading and protecting work |
| **Verified Originals** | 150 | Number of C2PA-signed files in your vault |
| **Dispute Record** | 150 | Successful dispute resolutions (clean record) |
| **Account Age** | 200 | How long you've been on the platform |

**Grades:**

| Grade | Title | Meaning |
|:--:|-------|---------|
| **S** | Elite Creator | Gold-tier, maximum trust — you're a verified power user |
| **A** | Trusted Creator | High trust, consistent protection history |
| **B** | Verified Creator | Good standing with verified originals |
| **C** | Active Creator | Regular user building trust |
| **D** | New Creator | Just getting started |

**What you get:** A visual badge with your grade, score, and full breakdown. You can **Export Proof of Authenticity** — a shareable certificate showing your trust level.

---

### ⛓️ 12. Blockchain Attestation

**What it does:** Creates an immutable, on-chain record of your content's hash — a permanent, tamper-proof timestamp that proves your file existed at a specific point in time.

**What you see:**
- A list of all your blockchain proofs with statuses:
  - ✅ **Confirmed** — Successfully recorded on-chain
  - ⏳ **Pending** — Transaction submitted, awaiting confirmation
  - 📁 **Local Only** — Stored locally but not yet on-chain
- Each proof shows:
  - **Asset name** and **hash** (copyable)
  - **Timestamp** of attestation
  - **Blockchain** used
  - **Verification URL** linking to the on-chain record

**Why it matters:** Blockchain records are permanent and cannot be modified. If you ever need to prove in court that your file existed before an infringer's version, the on-chain timestamp is irrefutable evidence.

---

### 🛡️ 13. Screenshot Guard

**What it does:** A client-side deterrent against screenshot-based content theft when viewing protected content in the browser.

**Protections applied:**
- **Right-click disabled** on protected content
- **DOM-level screenshot prevention** — CSS and JS techniques that make screenshots capture blank or distorted content
- Visual indication that content is protected

**Important note:** This is a deterrent, not an absolute prevention. Determined users can always find workarounds (screen recording, phone cameras, etc.). But it raises the effort bar significantly and signals clearly that the content is protected — which matters for legal proceedings.

---

## Tech Stack Summary

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 15+, TypeScript, Tailwind CSS |
| **Backend API** | Python FastAPI |
| **AI Engine** | Google Vertex AI (Gemini 3 Flash) |
| **Digital Signing** | Node.js + @contentauth/c2pa-node (C2PA microservice) |
| **Database** | Supabase (PostgreSQL) with Row Level Security |
| **File Storage** | Supabase Storage (encrypted buckets) |
| **Authentication** | Supabase Auth (email/password + Google OAuth) |
| **Key Management** | Google Cloud KMS |
| **Hosting** | Vercel (frontend) + Render (backend) |

---

## Authentication

CVBER supports two ways to sign in:

1. **Email & Password** — Standard registration and login with JWT tokens
2. **Google OAuth** — One-click sign-in with your Google account

All sessions are managed via JWT tokens with refresh capabilities. Every API request is authenticated — there's no way to access another user's data, even at the database level (thanks to RLS).

---

## Summary

CVBER is 13 features working together as one protection system:

| # | Feature | What It Does |
|:-:|---------|-------------|
| 1 | **AI Threat Detection** | Scans your files for security threats and originality |
| 2 | **C2PA Digital Signing** | Proves you're the creator with an unforgeable certificate |
| 3 | **Safe Vault** | Encrypts and stores your protected files |
| 4 | **Metadata Injection** | Embeds invisible ownership data inside your files |
| 5 | **Theft Monitoring** | Watches the internet for unauthorized copies |
| 6 | **Kill Switch** | Instantly revokes access when theft is found |
| 7 | **Licensing Engine** | Creates professional licenses for authorized use |
| 8 | **DMCA Generator** | Auto-generates legal takedown notices |
| 9 | **AI Security Mentor** | Chat assistant for security guidance |
| 10 | **Watermark Engine** | Adds visible watermarks to your images |
| 11 | **Trust Score** | Builds your creator reputation over time |
| 12 | **Blockchain Attestation** | Permanent on-chain proof of existence |
| 13 | **Screenshot Guard** | Deters screen-capture theft |

---

*Built with Next.js, FastAPI, Vertex AI, and the C2PA standard.*
