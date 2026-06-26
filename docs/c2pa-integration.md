# C2PA Integration

## What is C2PA?

The Coalition for Content Provenance and Authenticity (C2PA) is an industry standard for attaching provenance metadata to digital content. It helps verify where content came from and how it was created.

## How CVBER Uses C2PA

CVBER integrates C2PA as one layer in a broader evidence workflow:

1. **Signing** — Attach provenance metadata to uploaded artwork
2. **Verification** — Check C2PA signatures on uploaded files
3. **Evidence** — Include C2PA status in evidence packages

## C2PA Microservice

CVBER includes a Node.js microservice for C2PA operations:
- `POST /sign` — Sign a file with C2PA metadata
- `POST /verify` — Verify a C2PA signature
- `GET /health` — Service health check

## Current Status

| Feature | Status |
|---------|--------|
| C2PA signing | Experimental |
| C2PA verification | Experimental |
| Evidence integration | Working |
| Production-ready | No |

## Limitations

C2PA has important limitations that creators should understand:

1. **Can be stripped** — Platforms and tools may remove C2PA metadata during processing
2. **Not theft prevention** — C2PA proves provenance but does not prevent copying
3. **Requires tool support** — Not all viewers/editors preserve C2PA metadata
4. **Single layer** — CVBER combines C2PA with watermarking, hashing, and timestamps for stronger evidence

## Why CVBER Combines Multiple Signals

No single evidence layer is sufficient:
- **C2PA** — Provenance metadata (can be stripped)
- **Watermarking** — Invisible ownership marks (survives some processing)
- **Hashing** — File integrity proof (cryptographic)
- **Timestamps** — Proof of existence at a point in time
- **Reverse image search** — Proof of where content appears online

Together, these create a stronger evidence package than any single method.

## References

- [C2PA Specification](https://c2pa.org/specifications/)
- [C2PA Technical Specification 2.1](https://c2pa.org/specifications/2.1/)
