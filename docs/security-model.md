# Security Model

## Authentication

- JWT-based authentication with short-lived access tokens (30 minutes)
- Refresh token rotation
- Password hashing with bcrypt
- Supabase Auth for session management

## Authorization

- Row Level Security (RLS) on all database tables
- Users can only access their own data
- Server-side validation on all protected routes
- No client-side-only authorization

## File Handling

- Upload validation by file type and size
- Temporary processing — files not stored permanently in demo mode
- Hash-based integrity verification
- No execution of uploaded files

## Data Protection

- Secrets stored in environment variables only
- No API keys in repository
- No real user data in demo or tests
- Supabase service role key never exposed to frontend

## AI Provider Security

- API keys passed via environment variables
- No logging of API keys or secrets
- Mock mode available for development without real keys
- Rate limiting on AI endpoints

## Known Limitations

- Public demo uses mock mode — no real AI analysis without configured keys
- C2PA signing requires configured certificates
- No end-to-end encryption for uploads in current version
- Blockchain timestamps are public by design

## Reporting Vulnerabilities

See [SECURITY.md](SECURITY.md) for vulnerability reporting instructions.
