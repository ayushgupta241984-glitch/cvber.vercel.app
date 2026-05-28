"""
CVBER Backend Endpoint Verifier
Tests ALL backend endpoints and reports pass/fail.
"""
import httpx
import sys
import json
from urllib.parse import urljoin

BASE_URL = "http://localhost:8000"
PASS = "[OK]"
FAIL = "[FAIL]"

results = {"pass": 0, "fail": 0, "total": 0}

client = httpx.Client(base_url=BASE_URL, timeout=30.0)

def test(description: str, method: str, path: str, expected: int = None, **kwargs):
    results["total"] += 1
    url = urljoin(BASE_URL, path)
    try:
        resp = client.request(method, url, **kwargs)
        status = resp.status_code
        if expected is not None:
            ok = status == expected
        else:
            ok = status < 500  # not a 500 error
        if ok:
            results["pass"] += 1
            icon = PASS
        else:
            results["fail"] += 1
            icon = FAIL
        detail = ""
        if not ok:
            try:
                body = resp.json()
                detail = f" -> {body.get('detail', body)}"
            except Exception:
                detail = f" -> {resp.text[:200]}"
        print(f"  {icon} {status:>3} {description}{detail}")
    except Exception as e:
        results["fail"] += 1
        print(f"  {FAIL} --- {description} -> CONNECTION ERROR: {e}")

def section(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# ============================================================
section("1. Public Endpoints (no auth)")
# ============================================================

test("GET /", "GET", "/", expected=200)
test("GET /health", "GET", "/health", expected=200)
test("GET /api/ai-status", "GET", "/api/ai-status", expected=200)

test("POST /auth/login (invalid creds -> 401)",
      "POST", "/auth/login",
      json={"email": "nonexistent@test.com", "password": "wrong"},
      expected=401)

test("POST /auth/register (invalid input -> 400 from Supabase)",
      "POST", "/auth/register",
      json={"email": "not-an-email", "password": "12"},
      expected=400)

test("POST /auth/register (empty body -> 422)",
      "POST", "/auth/register",
      json={},
      expected=422)

test("POST /auth/login (empty body -> 422)",
      "POST", "/auth/login",
      json={},
      expected=422)

test("GET /auth/oauth/google",
      "GET", "/auth/oauth/google",
      expected=200)

test("GET /auth/oauth/github",
      "GET", "/auth/oauth/github",
      expected=200)

test("GET /auth/oauth/invalid (unsupported provider -> 400)",
      "GET", "/auth/oauth/invalid",
      expected=400)

test("POST /auth/refresh (invalid token -> 401)",
      "POST", "/auth/refresh",
      json={"refresh_token": "invalid.jwt.token"},
      expected=401)

test("POST /mentor/chat (no body -> 401, auth checked before body)",
      "POST", "/mentor/chat",
      json={},
      expected=401)

# ============================================================
section("2. Auth-Protected Endpoints (expect 401)")
# ============================================================

# Auth routes
test("GET /auth/me (no auth -> 401)", "GET", "/auth/me", expected=401)

# Scan routes
test("GET /scan/history (no auth -> 401)", "GET", "/scan/history", expected=401)
test("POST /scan (no auth -> 401)", "POST", "/scan", expected=401)
test("POST /scan/ (no auth -> 401)", "POST", "/scan/", expected=401)
test("POST /scan/verify (no auth -> 401)", "POST", "/scan/verify", expected=401)

# Diagnostics (router-level Depends)
test("GET /diagnostics/all (no auth -> 401)", "GET", "/diagnostics/all", expected=401)
test("GET /diagnostics/supabase (no auth -> 401)", "GET", "/diagnostics/supabase", expected=401)
test("GET /diagnostics/storage (no auth -> 401)", "GET", "/diagnostics/storage", expected=401)

# Vault routes
test("GET /vault/files (no auth -> 401)", "GET", "/vault/files", expected=401)
test("GET /vault/files/fake-id/url (no auth -> 401)", "GET", "/vault/files/fake-id/url", expected=401)
test("GET /vault/files/fake-id/download (no auth -> 401)", "GET", "/vault/files/fake-id/download", expected=401)
test("DELETE /vault/files/fake-id (no auth -> 401)", "DELETE", "/vault/files/fake-id", expected=401)
test("GET /vault/proofs/fake/ots-proof (no auth -> 401)", "GET", "/vault/proofs/fake/ots-proof", expected=401)
test("GET /vault/files/fake-id/proofs (no auth -> 401)", "GET", "/vault/files/fake-id/proofs", expected=401)
test("POST /vault/files/fake-id/ownership-proof (no auth -> 401)",
      "POST", "/vault/files/fake-id/ownership-proof?proof_type=test", expected=401)

# Mentor routes
test("POST /mentor/chat (no auth -> 401)",
      "POST", "/mentor/chat",
      json={"message": "hello"}, expected=401)

# Agent routes
test("POST /agent/chat (no auth -> 401)",
      "POST", "/agent/chat",
      json={"message": "hello"}, expected=401)

# Enforcement routes
test("POST /api/enforcement/dmca/generate (no auth -> 401)",
      "POST", "/api/enforcement/dmca/generate",
      json={"asset_name": "test", "asset_hash": "abc", "originality_score": 0.5,
            "forensic_summary": "test", "infringement_url": "http://example.com",
            "platform": "twitter", "owner_name": "test", "owner_email": "test@test.com"},
      expected=401)

test("GET /api/enforcement/dmca/platforms (no auth -> 401)",
      "GET", "/api/enforcement/dmca/platforms", expected=401)

test("POST /api/enforcement/trust/calculate (no auth -> 401)",
      "POST", "/api/enforcement/trust/calculate",
      json={"originality_average": 0.5, "upload_count": 1, "verified_originals": 0},
      expected=401)

test("POST /api/enforcement/license/create (no auth -> 401)",
      "POST", "/api/enforcement/license/create",
      json={"asset_hash": "abc", "asset_name": "test", "license_type": "personal",
            "licensee_name": "test", "licensee_email": "test@test.com", "licensor_name": "test"},
      expected=401)

test("GET /api/enforcement/license/types (no auth -> 401)",
      "GET", "/api/enforcement/license/types", expected=401)

test("POST /api/enforcement/monitor/register (no auth -> 401)",
      "POST", "/api/enforcement/monitor/register",
      json={"asset_id": "test", "asset_name": "test", "asset_hash": "abc"},
      expected=401)

test("POST /api/enforcement/killswitch/activate (no auth -> 401)",
      "POST", "/api/enforcement/killswitch/activate",
      json={"asset_id": "test", "asset_hash": "abc", "owner_id": "me", "reason": "test"},
      expected=401)

test("GET /api/enforcement/audit/verify-chain (no auth -> 401)",
      "GET", "/api/enforcement/audit/verify-chain", expected=401)

test("POST /api/enforcement/blockchain/timestamp (no auth -> 401)",
      "POST", "/api/enforcement/blockchain/timestamp",
      json={"asset_name": "test", "file_hash": "a"*64},
      expected=401)

test("GET /api/enforcement/blockchain/proofs (no auth -> 401)",
      "GET", "/api/enforcement/blockchain/proofs", expected=401)

# ============================================================
section("3. Response Body Validation (public endpoints)")
# ============================================================

try:
    resp = client.get("/")
    if resp.status_code == 200:
        data = resp.json()
        assert data.get("status") == "online", f"Expected 'online', got {data.get('status')}"
        assert "cvber" in data.get("service", "").lower()
        print(f"  {PASS} GET / -> body validates: {json.dumps(data)}")
    else:
        print(f"  {FAIL} GET / -> unexpected status {resp.status_code}")
except Exception as e:
    print(f"  {FAIL} GET / body validation error: {e}")

try:
    resp = client.get("/health")
    if resp.status_code == 200:
        data = resp.json()
        assert data.get("status") == "healthy"
        assert "services" in data
        assert data["services"].get("api") == "operational"
        print(f"  {PASS} GET /health -> body validates: status={data['status']}, api={data['services']['api']}")
except Exception as e:
    print(f"  {FAIL} GET /health body validation error: {e}")

try:
    resp = client.get("/api/ai-status")
    if resp.status_code == 200:
        data = resp.json()
        assert "ai_service" in data
        assert "environment" in data
        print(f"  {PASS} GET /api/ai-status -> body validates")
except Exception as e:
    print(f"  {FAIL} GET /api/ai-status body validation error: {e}")

try:
    resp = client.get("/auth/oauth/google")
    if resp.status_code == 200:
        data = resp.json()
        assert "url" in data
        assert "provider" in data
        assert data["provider"] == "google"
        print(f"  {PASS} GET /auth/oauth/google -> returns OAuth URL")
    else:
        print(f"  {FAIL} GET /auth/oauth/google -> expected 200 got {resp.status_code}")
except Exception as e:
    print(f"  {FAIL} GET /auth/oauth/google body validation error: {e}")

try:
    resp = client.get("/auth/oauth/invalid")
    if resp.status_code == 400:
        data = resp.json()
        assert "Unsupported provider" in data.get("detail", "")
        print(f"  {PASS} GET /auth/oauth/invalid -> returns error detail")
except Exception as e:
    print(f"  {FAIL} GET /auth/oauth/invalid body validation error: {e}")

# ============================================================
section("4. Protected Endpoints Return Correct Error Shape")
# ============================================================

for path, method, label in [
    ("/auth/me", "GET", "GET /auth/me"),
    ("/scan/history", "GET", "GET /scan/history"),
    ("/diagnostics/all", "GET", "GET /diagnostics/all"),
    ("/vault/files", "GET", "GET /vault/files"),
    ("/api/enforcement/dmca/platforms", "GET", "GET /api/enforcement/dmca/platforms"),
]:
    try:
        resp = client.request(method, path)
        if resp.status_code == 401:
            data = resp.json()
            assert "detail" in data
            print(f"  {PASS} {label} -> 401 with detail: {data['detail'][:60]}")
        else:
            print(f"  {FAIL} {label} -> expected 401 got {resp.status_code}")
    except Exception as e:
        print(f"  {FAIL} {label} -> error: {e}")

# ============================================================
section("5. Summary")
# ============================================================

print(f"\n  Total: {results['total']}")
print(f"  {PASS} Pass:  {results['pass']}")
print(f"  {FAIL} Fail:  {results['fail']}")
print(f"  Success Rate: {results['pass']/results['total']*100:.1f}%" if results['total'] > 0 else "  No tests run.")
print()
if results['fail'] == 0:
    print(f"  All endpoints working correctly!")
else:
    print(f"  {results['fail']} endpoint(s) failed. Review above for details.")

client.close()
sys.exit(0 if results['fail'] == 0 else 1)
