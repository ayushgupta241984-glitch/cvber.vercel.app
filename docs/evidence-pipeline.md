# Evidence Pipeline

## Overview

CVBER's evidence pipeline collects, processes, and packages proof of ownership for digital artwork. The goal is to create a timestamped evidence package that supports DMCA takedown requests and ownership claims.

## Pipeline Stages

### 1. Upload & Hash

- User uploads artwork (image file)
- SHA-256 hash computed for integrity verification
- Perceptual hash generated for similarity detection
- File metadata extracted (EXIF, dimensions, format)

### 2. AI Analysis

- Risk assessment (originality score, theft indicators)
- Style DNA fingerprinting (512-dimensional vector)
- Theft risk prediction (0-100 score)
- Screenshot detection (UI elements, status bars)

### 3. Reverse Image Search

Five search engines scan for copies online:
- Yandex Images
- Bing Visual Search
- Google Lens
- TinEye
- SauceNAO

Results include match URLs, similarity scores, and platform identification.

### 4. Evidence Assembly

The evidence package combines:
- Original file hash (SHA-256)
- Timestamp of upload
- AI analysis results
- Reverse image search matches
- Watermark verification
- C2PA provenance metadata (if available)
- Blockchain timestamp (if configured)

### 5. Evidence ZIP Download

Generated ZIP contains:
- Evidence report (PDF)
- Original file hash certificate
- Watermarked copy
- C2PA certificate (if signed)
- Blockchain proof (if anchored)
- DMCA template (ready to fill)

### 6. DMCA Workflow

- Pre-filled DMCA template with evidence references
- Platform-specific guidance
- Follow-up tracking

## Evidence Integrity

- All hashes are SHA-256
- Timestamps use UTC timezone
- Evidence records are append-only
- Chain integrity verification available

## Limitations

- Evidence supports ownership claims but does not guarantee legal outcomes
- C2PA metadata can be stripped by platforms
- Blockchain timestamps prove existence, not authorship
- Reverse image search coverage varies by engine
