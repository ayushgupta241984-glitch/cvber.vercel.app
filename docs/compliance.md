# CVBER Data & Compliance Framework

This document outlines the security controls, data processing agreements, and compliance measures implemented within the CVBER platform to protect artist data and ensure legal auditability.

## 1. Data Classification
| Data Type | Classification | Storage Location | Retention Policy |
|-----------|----------------|-----------------|------------------|
| User Credentials | Sensitive | Supabase Auth | Indefinite (until deletion) |
| Asset Hashes | Internal | Supabase `monitored_assets` | 30 Days (Active) / Archived |
| Original Artwork | Highly Sensitive | Memory/Ephemeral Storage | **Immediate Deletion** |
| Audit Logs | Critical | Supabase `audit_trail` | Indefinite (Read-Only) |

## 2. Security Infrastructure (Firewall & WAF)
- **Rate Limiting**: Implemented via `slowapi` on all sensitive endpoints (`/api/enforcement/*`, `/api/auth/*`).
- **Host Validation**: TrustedHostMiddleware ensures requests only originate from authorized domains.
- **Header Security**:
    - `CSP`: Restricts asset loading.
    - `HSTS`: Enforces SSL globally.
    - `X-Content-Type-Options`: Prevents MIME-sniffing.
- **Database**: All tables in the `public` schema are protected by **Row Level Security (RLS)** using `auth.uid() = user_id`.

## 3. C2PA & Metadata Integrity
- **Provenance**: CVBER adheres to the C2PA (Content Authenticity Initiative) standard for manifest injection.
- **Auditability**: Every certificate generation event is recorded in the `audit_trail` table with a hash-chained `previous_hash` to ensure forensic integrity.

## 4. Sub-Processor Registry
| Provider | Purpose | Data Shared | Compliance Status |
|----------|---------|-------------|-------------------|
| Supabase | Database & Auth | PII, Hashes, Metadata | GDPR / SOC2 |
| Groq | Forensic AI | Asset Metadata (No PII) | Enterprise Secure |
| Google Vertex AI | Image Analysis | Asset Metadata (No PII) | Enterprise Cloud |

## 5. GDPR & Rights Management
- **Right to Erasure**: Users can trigger full data deletion via their dashboard, which Cascades through `auth.users` to all linked `monitored_assets` and `theft_alerts`.
- **Right to Access**: Data is exportable via the user registry endpoints in machine-readable JSON format.

---
*Created: April 19, 2026*
*Audit Status: Hardened*
