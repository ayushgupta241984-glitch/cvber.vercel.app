# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in CVBER, please report it responsibly. Do not open a public GitHub issue for security vulnerabilities.

**Contact:** Open a private issue on GitHub or email the maintainers directly.

## What CVBER Handles

CVBER processes user-uploaded artwork files and generates evidence metadata. We take security seriously because this data supports copyright claims.

## Security Practices

- **Secrets are never committed.** All API keys, JWT secrets, and service credentials are stored in environment variables only.
- **File uploads are validated** by type and size before processing.
- **Server-side routes validate user access** before returning evidence records.
- **Row Level Security (RLS)** is enabled on the Supabase database.
- **No real user data** is included in the public demo or repository.

## Known Limitations

- The public demo uses mock mode by default. No real AI analysis is performed without configured API keys.
- Uploaded files are processed temporarily and not stored permanently in the public demo.
- C2PA signing requires a configured signing certificate and key.

## What We Do NOT Do

- We do not store private keys or secrets in the repository.
- We do not collect personal information beyond what is required for authentication.
- We do not guarantee legal outcomes. CVBER helps organize technical evidence — it is not a law firm and does not provide legal advice.

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |
| Older   | No        |

Always use the latest version from the main branch.
