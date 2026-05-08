# CVBER Implementation Plan

## Executive Summary

This plan outlines the complete implementation of CVBER as an art protection platform for digital artists. The plan is organized into phases, with each phase building upon the previous one.

---

## Current State Analysis

### Already Built ✅
- User signup and login with Google OAuth
- Image upload (PNG, JPG, WEBP up to 50MB)
- C2PA certificate generation
- Blockchain timestamp via OpenTimestamps
- Visible watermarking
- DMCA takedown automation
- AI theft detection (Groq/Google AI)
- Trust Score display
- User dashboard with SafeVault
- Supabase authentication and storage
- Render deployment configuration

### Missing / Needs to Be Built ❌
1. **Video Upload & Processing** - MP4/MOV up to 500MB
2. **Video Verification** - FFmpeg keyframe extraction + phi-4-multimodal AI
3. **Hash-Based Originality Checks** - SHA-256 and pHash against registry
4. **Bing Visual Search Integration** - Web scan for existing images
5. **Enhanced Originality Score** - 0-100 with detailed breakdown
6. **Steganographic Watermark** - Invisible watermark using invisible-watermark library
7. **Evidence ZIP Generation** - Complete folder structure with all evidence
8. **Rights Transfer System** - Buyer/seller transfer with PDF receipts
9. **Weekly Monitoring** - Automated scans with email alerts
10. **Cloudflare R2 Storage** - Replace Supabase Storage for files
11. **QR Verification Code** - Link to CVBER verify page
12. **PDF Certificate Generation** - Professional certificates

---

## Phase 1: Foundation & Infrastructure

### 1.1 Security & API Key Management
**Priority:** CRITICAL
**Estimated Time:** 2 hours

**Tasks:**
- [ ] Audit all environment variables for hardcoded values
- [ ] Implement `.env.example` with all required keys
- [ ] Add `.env` to `.gitignore` (verify it's already there)
- [ ] Create secrets management guide
- [ ] Add API key validation on startup
- [ ] Implement rate limiting for all endpoints

**Security Checklist:**
- [ ] No API keys in code
- [ ] All secrets in environment variables
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use parameterized queries)
- [ ] XSS prevention (sanitize user inputs)
- [ ] CSRF protection (implement CSRF tokens)

### 1.2 Cloudflare R2 Storage Integration
**Priority:** HIGH
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Set up Cloudflare R2 bucket
- [ ] Install `boto3` and `cloudflare` Python packages
- [ ] Create R2 storage service (`backend/app/services/r2_storage.py`)
- [ ] Implement upload/download/delete operations
- [ ] Add presigned URL generation
- [ ] Migrate existing storage logic from Supabase to R2
- [ ] Update environment variables for R2 credentials

**Files to Create:**
- `backend/app/services/r2_storage.py`
- `backend/app/config.py` (add R2 config)

**Files to Modify:**
- `backend/app/routers/scan.py` (use R2 for file storage)
- `backend/requirements.txt` (add boto3, cloudflare)

### 1.3 Database Schema Updates
**Priority:** HIGH
**Estimated Time:** 3 hours

**Tasks:**
- [ ] Create migration for new tables
- [ ] Add `artworks` table (replaces generic file storage)
- [ ] Add `video_uploads` table
- [ ] Add `originality_checks` table
- [ ] Add `rights_transfers` table
- [ ] Add `monitoring_jobs` table
- [ ] Update RLS policies for new tables

**New Tables:**
```sql
-- Artworks table
CREATE TABLE artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    original_file_path TEXT NOT NULL,
    protected_file_path TEXT NOT NULL,
    file_hash TEXT NOT NULL UNIQUE,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    originality_score INTEGER CHECK (originality_score >= 0 AND originality_score <= 100),
    protection_level TEXT DEFAULT 'standard',
    has_watermark BOOLEAN DEFAULT false,
    has_c2pa BOOLEAN DEFAULT false,
    has_blockchain_proof BOOLEAN DEFAULT false,
    qr_enabled BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video uploads table
CREATE TABLE video_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    video_path TEXT NOT NULL,
    video_size INTEGER NOT NULL,
    video_duration INTEGER NOT NULL,
    keyframes_path TEXT,
    verification_status TEXT DEFAULT 'pending',
    ai_confidence FLOAT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Originality checks table
CREATE TABLE originality_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    sha256_match BOOLEAN DEFAULT false,
    phash_match BOOLEAN DEFAULT false,
    phash_distance FLOAT,
    bing_search_results JSONB,
    web_scan_status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rights transfers table
CREATE TABLE rights_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES profiles(id),
    to_user_id UUID REFERENCES profiles(id),
    to_email TEXT NOT NULL,
    to_name TEXT NOT NULL,
    transfer_date TIMESTAMPTZ DEFAULT NOW(),
    receipt_path TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monitoring jobs table
CREATE TABLE monitoring_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artwork_id UUID NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
    last_scan_at TIMESTAMPTZ,
    next_scan_at TIMESTAMPTZ,
    scan_frequency_hours INTEGER DEFAULT 168, -- 1 week
    total_scans INTEGER DEFAULT 0,
    total_detections INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 2: Video Upload & Verification

### 2.1 Video Upload System
**Priority:** HIGH
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Install FFmpeg on server (or use FFmpeg Python wrapper)
- [ ] Add `ffmpeg-python` to requirements
- [ ] Create video upload endpoint
- [ ] Implement video validation (format, size, duration)
- [ ] Add video upload to R2 storage
- [ ] Create frontend video upload component
- [ ] Add progress tracking for large video uploads

**Files to Create:**
- `backend/app/services/video_processor.py`
- `backend/app/routers/video.py`
- `frontend/src/components/dashboard/VideoUploader.tsx`

**Files to Modify:**
- `backend/requirements.txt` (add ffmpeg-python)
- `frontend/src/app/dashboard/page.tsx` (add video upload)

### 2.2 Keyframe Extraction
**Priority:** HIGH
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Implement FFmpeg keyframe extraction
- [ ] Extract 5 keyframes from video
- [ ] Save keyframes to R2 storage
- [ ] Create keyframe preview component
- [ ] Add keyframe metadata to database

**Implementation Details:**
```python
# Extract 5 evenly spaced keyframes
def extract_keyframes(video_path: str, output_dir: str, count: int = 5):
    import ffmpeg
    # Get video duration
    probe = ffmpeg.probe(video_path)
    duration = float(probe['streams'][0]['duration'])

    # Calculate timestamps for keyframes
    timestamps = [duration * (i + 1) / (count + 1) for i in range(count)]

    # Extract keyframes
    keyframes = []
    for i, timestamp in enumerate(timestamps):
        output_path = f"{output_dir}/keyframe_{i+1}.jpg"
        (
            ffmpeg
            .input(video_path, ss=timestamp)
            .output(output_path, vframes=1, format='image2', vcodec='mjpeg')
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        keyframes.append(output_path)

    return keyframes
```

### 2.3 phi-4-multimodal Video Verification
**Priority:** HIGH
**Estimated Time:** 8 hours

**Tasks:**
- [ ] Research phi-4-multimodal API availability
- [ ] Implement phi-4-multimodal integration
- [ ] Create video verification prompt
- [ ] Send keyframes + final image to AI
- [ ] Parse AI verification response
- [ ] Store verification results in database
- [ ] Display verification status to user

**Files to Create:**
- `backend/app/services/phi4_service.py`
- `backend/app/services/video_verification.py`

**Implementation Details:**
```python
async def verify_video_creation(
    keyframes: List[bytes],
    final_image: bytes,
    artwork_title: str
) -> Dict[str, Any]:
    """
    Verify that the video shows the creation of the artwork.
    Uses phi-4-multimodal to analyze keyframes and final image.
    """
    prompt = f"""
    You are a digital forensics expert. Analyze these images:

    1. Five keyframes from a creation video
    2. The final artwork titled: {artwork_title}

    Determine if the video authentically shows the creation of this artwork.

    Return JSON:
    {{
        "is_authentic": true/false,
        "confidence": 0.0-1.0,
        "evidence": ["list of visual evidence"],
        "concerns": ["any concerns or red flags"],
        "verification_statement": "detailed explanation"
    }}
    """

    # Call phi-4-multimodal API
    # ...
```

---

## Phase 3: Originality Scoring System

### 3.1 SHA-256 Hash Check
**Priority:** HIGH
**Estimated Time:** 3 hours

**Tasks:**
- [ ] Implement SHA-256 hash generation
- [ ] Create hash registry lookup
- [ ] Check against existing artworks
- [ ] Handle hash collisions
- [ ] Store hash in database

**Files to Create:**
- `backend/app/services/hash_checker.py`

### 3.2 pHash Perceptual Hash Check
**Priority:** HIGH
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Install `ImageHash` Python package
- [ ] Implement pHash generation
- [ ] Create pHash similarity comparison
- [ ] Set similarity threshold (e.g., 95%)
- [ ] Store pHash in database
- [ ] Create pHash index for fast lookup

**Files to Modify:**
- `backend/requirements.txt` (add ImageHash)

**Implementation Details:**
```python
from PIL import Image
import imagehash

def generate_phash(image_path: str) -> str:
    """Generate perceptual hash for image."""
    img = Image.open(image_path)
    return str(imagehash.phash(img))

def compare_phash(hash1: str, hash2: str) -> float:
    """Compare two perceptual hashes and return similarity score."""
    h1 = imagehash.hex_to_hash(hash1)
    h2 = imagehash.hex_to_hash(hash2)
    # Hamming distance: 0 = identical, 64 = completely different
    distance = h1 - h2
    similarity = (64 - distance) / 64 * 100
    return similarity
```

### 3.3 Bing Visual Search Integration
**Priority:** MEDIUM
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Research Bing Visual Search API
- [ ] Implement Bing API integration
- [ ] Create reverse image search
- [ ] Parse search results
- [ ] Filter results for potential matches
- [ ] Store search results in database
- [ ] Display findings to user

**Files to Create:**
- `backend/app/services/bing_search.py`

**Implementation Details:**
```python
async def bing_visual_search(image_bytes: bytes) -> Dict[str, Any]:
    """
    Search Bing Visual Search for similar images.
    Returns potential matches and their sources.
    """
    # Upload image to Bing Visual Search API
    # Get reverse image search results
    # Filter for high-confidence matches
    # Return structured results
```

### 3.4 Enhanced Originality Score
**Priority:** HIGH
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Combine all check results into single score
- [ ] Implement scoring algorithm
- [ ] Create score breakdown display
- [ ] Add score thresholds (70+ to pass)
- [ ] Store score in database

**Scoring Algorithm:**
```
Originality Score (0-100):
- SHA-256 match: -100 (automatic fail)
- pHash match (>95%): -50
- Bing Visual Search match: -30 per match
- Video verification failed: -40
- No video uploaded: -20
- Base score: 100
```

---

## Phase 4: Protection Pipeline

### 4.1 Steganographic Watermark
**Priority:** HIGH
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Install `invisible-watermark` Python package
- [ ] Implement invisible watermark embedding
- [ ] Test watermark survivability (screenshots, recompression)
- [ ] Add watermark extraction for verification
- [ ] Create watermark configuration options

**Files to Create:**
- `backend/app/services/steganographic_watermark.py`

**Files to Modify:**
- `backend/requirements.txt` (add invisible-watermark)

**Implementation Details:**
```python
from imwatermark import WatermarkEncoder

def embed_invisible_watermark(
    image_path: str,
    message: str,
    output_path: str
) -> None:
    """
    Embed invisible watermark into image.
    Watermark survives screenshots and recompression.
    """
    encoder = WatermarkEncoder()
    encoder.set_watermark('bytes', message.encode('utf-8'))
    img = cv2.imread(image_path)
    encoded = encoder.encode(img, 'dwtDct')
    cv2.imwrite(output_path, encoded)
```

### 4.2 QR Verification Code
**Priority:** MEDIUM
**Estimated Time:** 3 hours

**Tasks:**
- [ ] Install `qrcode` Python package
- [ ] Implement QR code generation
- [ ] Create verification URL structure
- [ ] Add QR code to image (optional overlay)
- [ ] Create QR code toggle in UI

**Files to Create:**
- `backend/app/services/qr_generator.py`

**Files to Modify:**
- `backend/requirements.txt` (add qrcode)

### 4.3 PDF Certificate Generation
**Priority:** MEDIUM
**Estimated Time:** 5 hours

**Tasks:**
- [ ] Install `reportlab` Python package
- [ ] Create certificate template
- [ ] Implement PDF generation
- [ ] Add artwork preview to certificate
- [ ] Include all metadata and proofs
- [ ] Create certificate download endpoint

**Files to Create:**
- `backend/app/services/certificate_generator.py`

**Files to Modify:**
- `backend/requirements.txt` (add reportlab)

### 4.4 Evidence ZIP Generation
**Priority:** HIGH
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Create ZIP generation service
- [ ] Implement folder structure:
  ```
  00_COVER_PAGE.pdf
  01_ORIGINALITY_REPORT.pdf
  02_CERTIFICATE.pdf
  03_CREATION_VIDEO.mp4
  04_VIDEO_KEYFRAMES/ (5 JPGs)
  05_ORIGINAL_IMAGE.png
  06_PROTECTED_IMAGE.png
  07_BLOCKCHAIN_PROOF.ots
  08_HOW_TO_USE_THIS.pdf
  ```
- [ ] Generate all required PDFs
- [ ] Package all files into ZIP
- [ ] Create ZIP download endpoint
- [ ] Add ZIP generation to dashboard

**Files to Create:**
- `backend/app/services/evidence_zip.py`

---

## Phase 5: Rights Transfer System

### 5.1 Rights Transfer Flow
**Priority:** MEDIUM
**Estimated Time:** 8 hours

**Tasks:**
- [ ] Create rights transfer form
- [ ] Implement transfer validation
- [ ] Generate Rights Transfer Receipt PDF
- [ ] Update artwork ownership in database
- [ ] Send email notifications to both parties
- [ ] Create transfer history view

**Files to Create:**
- `backend/app/routers/rights_transfer.py`
- `backend/app/services/rights_transfer.py`
- `frontend/src/components/dashboard/RightsTransfer.tsx`

**Files to Modify:**
- `frontend/src/app/dashboard/page.tsx` (add rights transfer)

### 5.2 Receipt PDF Generation
**Priority:** MEDIUM
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Create receipt template
- [ ] Include all transfer details
- [ ] Add digital signature
- [ ] Generate PDF for both parties
- [ ] Store receipt in R2

---

## Phase 6: Monitoring & Alerts

### 6.1 Weekly Monitoring System
**Priority:** MEDIUM
**Estimated Time:** 8 hours

**Tasks:**
- [ ] Create monitoring job scheduler
- [ ] Implement weekly scan trigger
- [ ] Run Bing Visual Search on all artworks
- [ ] Compare results with previous scans
- [ ] Detect new unauthorized uses
- [ ] Update monitoring job status

**Files to Create:**
- `backend/app/services/monitoring_scheduler.py`
- `backend/app/services/weekly_monitor.py`

### 6.2 Email Alerts
**Priority:** MEDIUM
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Set up email service (SendGrid/Resend)
- [ ] Create email templates
- [ ] Implement alert sending
- [ ] Add unsubscribe option
- [ ] Test email delivery

**Files to Create:**
- `backend/app/services/email_service.py`
- `backend/app/templates/email_alert.html`

**Files to Modify:**
- `backend/requirements.txt` (add sendgrid or resend)

---

## Phase 7: Frontend Enhancements

### 7.1 Dashboard Updates
**Priority:** MEDIUM
**Estimated Time:** 8 hours

**Tasks:**
- [ ] Add video upload section
- [ ] Display originality score breakdown
- [ ] Show verification status
- [ ] Add evidence ZIP download button
- [ ] Display rights transfer history
- [ ] Show monitoring status

**Files to Modify:**
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/components/dashboard/SafeVault.tsx`

### 7.2 Upload Flow Updates
**Priority:** HIGH
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Create multi-step upload wizard
- [ ] Step 1: Upload artwork
- [ ] Step 2: Upload video (required)
- [ ] Step 3: Review scan results
- [ ] Step 4: Configure protection options
- [ ] Step 5: Download deliverables

**Files to Create:**
- `frontend/src/components/dashboard/UploadWizard.tsx`
- `frontend/src/components/dashboard/UploadStep1.tsx`
- `frontend/src/components/dashboard/UploadStep2.tsx`
- `frontend/src/components/dashboard/UploadStep3.tsx`
- `frontend/src/components/dashboard/UploadStep4.tsx`
- `frontend/src/components/dashboard/UploadStep5.tsx`

### 7.3 Verification Page
**Priority:** MEDIUM
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Create public verification page
- [ ] Accept artwork hash or QR scan
- [ ] Display verification results
- [ ] Show certificate details
- [ ] Add verification badge

**Files to Create:**
- `frontend/src/app/verify/[hash]/page.tsx` (update existing)

---

## Phase 8: Testing & Security

### 8.1 Security Audit
**Priority:** CRITICAL
**Estimated Time:** 8 hours

**Tasks:**
- [ ] Run dependency vulnerability scan
- [ ] Check for hardcoded secrets
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Verify API rate limiting
- [ ] Test authentication bypasses
- [ ] Review file upload security

**Tools to Use:**
- `safety` for Python dependency vulnerabilities
- `npm audit` for Node.js vulnerabilities
- `bandit` for Python security issues
- Manual code review

### 8.2 Integration Testing
**Priority:** HIGH
**Estimated Time:** 10 hours

**Tasks:**
- [ ] Test complete upload flow
- [ ] Test video verification
- [ ] Test originality scoring
- [ ] Test protection pipeline
- [ ] Test evidence ZIP generation
- [ ] Test rights transfer
- [ ] Test monitoring system
- [ ] Test email alerts

### 8.3 Performance Testing
**Priority:** MEDIUM
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Test large file uploads (50MB images, 500MB videos)
- [ ] Test concurrent uploads
- [ ] Measure API response times
- [ ] Optimize slow endpoints
- [ ] Test database query performance

---

## Phase 9: Deployment

### 9.1 Pre-Deployment Checklist
**Priority:** CRITICAL
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Verify all environment variables are set
- [ ] Confirm no hardcoded secrets in code
- [ ] Test production database migrations
- [ ] Verify R2 storage is configured
- [ ] Test email service in production
- [ ] Verify all API keys are valid
- [ ] Check CORS configuration
- [ ] Test authentication flow

### 9.2 Deployment Steps
**Priority:** CRITICAL
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Create production build of frontend
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend to Render
- [ ] Run database migrations
- [ ] Verify all services are healthy
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Set up alerts

### 9.3 Post-Deployment Monitoring
**Priority:** HIGH
**Estimated Time:** Ongoing

**Tasks:**
- [ ] Monitor error rates
- [ ] Track API response times
- [ ] Monitor storage usage
- [ ] Track user signups
- [ ] Monitor email delivery rates
- [ ] Review security logs

---

## Phase 10: Documentation

### 10.1 User Documentation
**Priority:** MEDIUM
**Estimated Time:** 6 hours

**Tasks:**
- [ ] Create user guide
- [ ] Document upload process
- [ ] Explain verification process
- [ ] Document rights transfer
- [ ] Create FAQ
- [ ] Add troubleshooting guide

### 10.2 Developer Documentation
**Priority:** MEDIUM
**Estimated Time:** 4 hours

**Tasks:**
- [ ] Update README
- [ ] Document API endpoints
- [ ] Document database schema
- [ ] Add deployment guide
- [ ] Document environment variables
- [ ] Create contribution guide

---

## Security Best Practices

### API Key Management
- Never commit API keys to git
- Use environment variables for all secrets
- Rotate API keys regularly
- Use different keys for dev/staging/prod
- Implement key validation on startup

### File Upload Security
- Validate file types (magic bytes, not just extension)
- Limit file sizes (50MB images, 500MB videos)
- Scan uploaded files for malware
- Store files in private buckets
- Use presigned URLs for downloads
- Sanitize file names

### Database Security
- Use parameterized queries
- Implement Row Level Security
- Never expose database errors to users
- Use read-only replicas for reporting
- Regular database backups

### API Security
- Implement rate limiting
- Use HTTPS everywhere
- Validate all input
- Implement CORS properly
- Use JWT for authentication
- Log all security events

### Code Security
- Keep dependencies updated
- Run security scans regularly
- Review code for vulnerabilities
- Use linting tools
- Implement code review process

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Foundation | 9 hours | None |
| Phase 2: Video | 18 hours | Phase 1 |
| Phase 3: Originality | 17 hours | Phase 1 |
| Phase 4: Protection | 20 hours | Phase 1, 2, 3 |
| Phase 5: Rights Transfer | 12 hours | Phase 1, 4 |
| Phase 6: Monitoring | 14 hours | Phase 1, 3 |
| Phase 7: Frontend | 18 hours | Phase 2, 3, 4, 5, 6 |
| Phase 8: Testing | 24 hours | All previous |
| Phase 9: Deployment | 8 hours | Phase 8 |
| Phase 10: Documentation | 10 hours | All previous |

**Total Estimated Time:** ~150 hours (~4 weeks full-time)

---

## Next Steps

1. **Start with Phase 1** - Security audit and infrastructure setup
2. **Get approval** - Review this plan and get sign-off
3. **Begin implementation** - Start with highest priority items
4. **Test continuously** - Don't wait until the end to test
5. **Deploy incrementally** - Ship features as they're completed

---

## Questions & Decisions Needed

1. **phi-4-multimodal availability** - Is the API publicly available? Do we need an API key?
2. **Bing Visual Search API** - Do we have access? What are the rate limits?
3. **Email service** - Should we use SendGrid, Resend, or another provider?
4. **Monitoring frequency** - Is weekly the right frequency? Should it be configurable?
5. **Storage costs** - What's our budget for Cloudflare R2 storage?
6. **Deployment access** - Will we have access to the production environment?

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|:--:|:--:|-------------|
| phi-4 API unavailable | Medium | High | Fallback to other multimodal models |
| Bing API rate limits | Medium | Medium | Implement caching and queueing |
| Large video uploads timeout | High | Medium | Implement chunked uploads |
| Storage costs exceed budget | Medium | High | Implement usage limits and alerts |
| Email delivery failures | Low | Medium | Use reliable provider with retries |
| Security vulnerabilities | Low | Critical | Regular security audits |

---

## Success Criteria

- [ ] All 10 steps of the CVBER flow are implemented
- [ ] Video verification works reliably
- [ ] Originality scoring is accurate
- [ ] Evidence ZIP generation works
- [ ] Rights transfer system is functional
- [ ] Weekly monitoring runs automatically
- [ ] Security audit passes with no critical issues
- [ ] All tests pass
- [ ] Deployment is successful
- [ ] Documentation is complete
