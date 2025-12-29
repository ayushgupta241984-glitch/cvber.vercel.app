# CVBER Free - AI-Powered Cybersecurity Platform

A comprehensive full-stack cybersecurity platform featuring AI-powered threat detection, C2PA digital authenticity verification, and secure encrypted storage.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```powershell
# Install all dependencies
.\setup.ps1

# Start all services
.\start.ps1
```

Then open `http://localhost:3000` in your browser!

### Option 2: Manual Setup

```powershell
# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# C2PA Service (new terminal)
cd c2pa-service
npm install
npm run dev
```

> **Note**: The app works with mock data by default. No external services required for testing!

---

## 🚀 Features

- **AI Threat Detection**: Powered by Vertex AI (Gemini 3 Flash) with HIGH thinking level for comprehensive security analysis
- **C2PA Digital Signatures**: Industry-standard digital authenticity verification with provenance tracking
- **Secure Vault**: Encrypted storage with Row Level Security (RLS) and real-time threat monitoring
- **AI Security Mentor**: Interactive chat assistant to guide users through security findings
- **Dark-Themed Dashboard**: Modern, responsive UI with glassmorphism and gradient effects

## 🏗️ Architecture

### Monorepo Structure

```
cvber-free/
├── frontend/          # Next.js 15+ (App Router)
├── backend/           # Python FastAPI
├── c2pa-service/      # Node.js C2PA microservice
└── supabase/          # Database migrations
```

### Technology Stack

**Frontend:**
- Next.js 15+ with App Router
- TypeScript
- Tailwind CSS
- Lucide Icons
- Supabase Auth

**Backend:**
- Python FastAPI
- Vertex AI (Gemini 3 Flash)
- Supabase (PostgreSQL)
- Google Cloud KMS

**C2PA Service:**
- Node.js + Express
- @contentauth/c2pa-node
- TypeScript

## 📋 Prerequisites

1. **Node.js** (v18+)
2. **Python** (3.10+)
3. **Google Cloud Account** with:
   - Vertex AI API enabled
   - Cloud KMS configured
   - Service account with appropriate permissions
4. **Supabase Project** with:
   - Database created
   - Storage buckets configured
   - Auth providers enabled

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd cvber-free

# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt

# C2PA Service
cd ../c2pa-service
npm install
```

### 2. Configure Environment Variables

Create `.env` files in each directory based on `.env.example`:

**Root `.env`:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Cloud
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Vertex AI
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-3-flash

# Cloud KMS
KMS_KEYRING=cvber-free-keyring
KMS_KEY=c2pa-signing-key

# Backend
BACKEND_URL=http://localhost:8000
JWT_SECRET=your-secret-key

# C2PA Service
C2PA_SERVICE_URL=http://localhost:3001
```

### 3. Setup Supabase Database

Run the migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually execute the SQL in supabase/migrations/001_initial_schema.sql
```

Create storage buckets in Supabase dashboard:
- `safe-vault` (private, encrypted)
- `scan-results` (private)

### 4. Setup Google Cloud

1. Create a service account with these roles:
   - Vertex AI User
   - Cloud KMS CryptoKey Encrypter/Decrypter

2. Download the service account JSON key and save as `service-account.json`

3. Create KMS keyring and key:
```bash
gcloud kms keyrings create cvber-free-keyring --location=us-central1
gcloud kms keys create c2pa-signing-key --location=us-central1 --keyring=cvber-free-keyring --purpose=encryption
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - C2PA Service:**
```bash
cd c2pa-service
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**C2PA Service:**
```bash
cd c2pa-service
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📡 API Endpoints

### Backend (FastAPI)

**Health Check:**
- `GET /` - API status
- `GET /health` - Detailed health check

**Authentication:**
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with credentials
- `GET /auth/me` - Get current user profile

**Scanning:**
- `POST /scan/` - Upload and scan file
- `POST /scan/verify` - Verify file with C2PA signature
- `GET /scan/history` - Get scan history

### C2PA Service

- `POST /sign` - Sign file with C2PA
- `POST /verify` - Verify C2PA signature
- `GET /health` - Service health check

## 🎨 UI Components

### Dashboard
- **FileUploader**: Drag-and-drop file upload with progress tracking
- **SafeVault**: Grid view of scanned files with risk scores
- **SecurityMentor**: AI chat assistant for security guidance

### Authentication
- Email/password login
- Google OAuth integration
- JWT token management

## 🔒 Security Features

1. **Row Level Security (RLS)**: Database-level access control
2. **Encrypted Storage**: All files encrypted at rest
3. **JWT Authentication**: Secure token-based auth
4. **C2PA Provenance**: Digital signature verification
5. **AI Threat Analysis**: Deep learning-based threat detection

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### Browser Testing
Use the integrated browser tool to:
1. Navigate to dashboard
2. Upload test files
3. Verify scan results
4. Test C2PA signatures

## 📝 Database Schema

**profiles**
- User profile information
- Links to auth.users

**audit_logs**
- Security event tracking
- Scan history

**verification_meta**
- C2PA verification records
- Provenance data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced threat intelligence
- [ ] Team collaboration features
- [ ] API rate limiting
- [ ] Webhook integrations
- [ ] Advanced analytics dashboard

---

Built with ❤️ using Next.js, FastAPI, and Vertex AI
