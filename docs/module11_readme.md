# Module 11 — Secure Communication (TLS)

> **Status**: Completed. Implemented and verified (4 backend TLS tests, 5 hospital-client TLS tests,
> 3 Flower TLS integration tests; see [Verification](#verification)). All network connections that
> cross a machine boundary are covered. Known limitations and architectural boundaries are explicitly
> documented; items needing further development are cataloged under [Future Work](#future-work).

---

## Overview

Module 11 secures every network connection that crosses a machine boundary in the MedFL platform.
Without TLS, bearer tokens (JWTs), model weights, and patient-derived gradients travel in plain text
— a passive eavesdropper on the hospital network can reconstruct the model or replay the token.

Five distinct communication links exist across the system:

| Link | From → To | Protocol | TLS Status | Details |
|------|-----------|----------|------------|---------|
| **[1]** | Browser → Backend (`:5000`) | HTTPS / WSS (`TLSv1.2+`) | ✅ Required | Node.js HTTPS server with explicit `minVersion: 'TLSv1.2'`; Socket.io attached |
| **[2]** | Backend → `api_adapter.py` / Flower server | Subprocess (stdin/stdout) | N/A | Local operating system process spawn; no network sockets |
| **[3]** | Hospital ML service → Backend (`:5000`) | HTTPS REST | ✅ Required | Strict `SSLContext` enforcing `ML_BACKEND_CA` verification; raises `ApiError(502)` with SAN guidance |
| **[4]** | Hospital ML service → Flower server | gRPC over TLS | ✅ Required | `fl.client.start_client` with `root_certificates`; bounded retries; Rule 1: no silent downgrade |
| **[5]** | Hospital operator browser → Hospital ML service | HTTP loopback (`127.0.0.1:8765`) | N/A (Loopback) | W3C Trustworthy Origin; local loopback calls only, CORS-restricted |

---

## Architecture

```
       Admin / Researcher Browser (HTTPS)
                       │
                       │ [1] HTTPS + WSS (TLS 1.2+)
                       ▼
       ┌────────────────────────────────────────────────────────┐
       │ Backend API & Socket.io (Node.js, :5000)                │◄──────────────┐
       └──────────────┬─────────────────────────────────────────┘               │
                      │                                                         │ [3] HTTPS REST
  [2] Subprocess      │ (spawns Flower server                                   │     (CA verified)
      (No network;    │  subprocess per job)                                    │
       No TLS needed) ▼                                                         │
       ┌────────────────────────────────────────────────────────┐               │
       │ Flower Server (federation/flower_app, gRPC)            │               │
       └──────────────────────────▲─────────────────────────────┘               │
                                  │                                             │
                                  │ [4] gRPC over TLS                           │
                                  │     (CA verified)                           │
                                  │                                             │
                      ┌───────────┴─────────────────────────────┐               │
                      │ Hospital Client ML Service (Python)     ├───────────────┘
                      │ (127.0.0.1:8765)                        │
                      └───────────────────▲─────────────────────┘
                                          │
                                          │ [5] HTTP Loopback (127.0.0.1:8765)
                                          │     (W3C Trustworthy Origin; No TLS needed)
                      ┌───────────────────┴─────────────────────┐
                      │ Hospital Operator Browser               │
                      └─────────────────────────────────────────┘
```

---

## Components

### 1. Certificate Tooling — `scripts/make_dev_certs.py`

Generates a 2048-bit RSA local CA and a signed server certificate with SANs:

```bash
# Generate dev certs (do not overwrite existing without --force)
python scripts/make_dev_certs.py --out-dir certs

# With optional LAN IP for multi-machine testing
python scripts/make_dev_certs.py --out-dir certs --lan-ip 192.168.1.100
```

**Generated files** (all gitignored):

| File | Purpose |
|------|---------|
| `certs/ca.pem` | Local CA certificate (trust anchor) |
| `certs/ca.key` | CA private key (restricted permissions, never printed) |
| `certs/server.pem` | Server certificate (SANs: localhost, 127.0.0.1, ::1) |
| `certs/server.key` | Server private key (restricted permissions) |

**Windows browser trust** (run once, removes itself with the untrust command):
```powershell
# Trust (adds to Current User Root store)
certutil -user -addstore Root certs\ca.pem

# Untrust / cleanup
certutil -user -delstore Root "MedFL Local Development CA"
```

### 2. Backend HTTPS — `backend/server.js`

When `TLS_ENABLED=true`, the backend starts an HTTPS server with `minVersion: 'TLSv1.2'`. A missing
or unreadable certificate/key file causes immediate startup failure — there is no silent HTTP fallback.

**Environment variables** (`.env`):

| Variable | Description |
|----------|-------------|
| `TLS_ENABLED` | `true` to enable HTTPS |
| `TLS_CERT_PATH` | Path to server certificate (`certs/server.pem`) |
| `TLS_KEY_PATH` | Path to server private key (`certs/server.key`) |

```dotenv
TLS_ENABLED=true
TLS_CERT_PATH=certs/server.pem
TLS_KEY_PATH=certs/server.key
```

Socket.io is attached to the same HTTPS server and therefore automatically uses WSS.

### 3. Hospital ML Service → Backend — `hospital_client/local_api/server.py`

All backend calls (`/auth/me`, `/federation/jobs`, `/federation/rounds/*/base-model/*`,
`/federation/jobs/*/rounds/*/submit`, `/federation/jobs/*/flower/report`) now go through
`backend_urlopen()`, which:

- Returns `None` (no TLS) for HTTP URLs, so existing test mocks remain compatible.
- For HTTPS URLs, loads a strict `SSLContext` from `ML_BACKEND_CA` (or system CAs if not set).
- Raises `ApiError(502)` with a clear SAN-guidance message on certificate verification failure.
- **Never** disables verification (`verify_mode = CERT_REQUIRED`, `check_hostname = True`).

A startup security warning is printed if `ML_BACKEND_URL` is plain HTTP to a non-loopback host.

**Environment variables** (hospital operator's shell):

| Variable | Description |
|----------|-------------|
| `ML_BACKEND_URL` | Backend base URL (e.g. `https://hospital-server:5000/api/v1`) |
| `ML_BACKEND_CA` | Path to CA cert for backend TLS verification |

### 4. Flower Server TLS — `federation/flower_app/server.py` & `__main__.py`

`serve()` now accepts an optional `certificates` parameter (a `(ca_bytes, cert_bytes, key_bytes)` tuple)
passed directly to `fl.server.start_server`. The `__main__.py` entry point accepts:

```
--ca-cert     Path to CA certificate
--server-cert Path to server certificate
--server-key  Path to server private key
--backend-ca  CA for verifying backend HTTPS calls from the Flower server process
```

The backend's `flowerService.js` automatically passes these arguments when `TLS_ENABLED=true` and the
corresponding `FLOWER_CA_CERT` / `FLOWER_SERVER_CERT` / `FLOWER_SERVER_KEY` environment variables
(or their `TLS_*` fallbacks) are set.

### 5. Flower Client TLS & No-Silent-Downgrade Rule — `hospital_client/federation/flower_client.py`

`FlowerConnection` now accepts `ca_path`, `root_certificates`, `insecure`, `max_retries`, and
`max_wait_time`. The `r_flower_connect` handler in `local_api/server.py` enforces **Rule 1**:

> **If `ML_BACKEND_URL` is `https://`, the Flower client MUST use TLS. A missing or unreadable
> CA certificate is an error (HTTP 400) with a clear message. `insecure=True` is never set
> in TLS mode.**

Rationale: the hospital's bearer token and model weights travel over the Flower channel, and the
Flower server address comes from the browser request — a compromised page could redirect to a
plain-text server that captures both.

TLS-mode CA resolution order:
1. `FLOWER_CA` environment variable
2. `ML_BACKEND_CA` environment variable
3. `ca_path` field in the request body
4. `certs/ca.pem` in the repo root (auto-detected)

---

## Known Limitations

- **CORS / Socket.io origins**: The backend accepts any origin in development mode. In production,
  `CORS_ORIGIN` should be set to the exact frontend origin.
- **No mutual TLS (mTLS)**: The server verifies itself to clients but clients do not present
  certificates to the server. mTLS would require hospital-specific client certs and a PKI.
- **No certificate rotation or revocation**: Replacing certificates requires restarting the backend
  and Flower server. CRL/OCSP support is out of scope.
- **Browser → Local ML service** (`http://127.0.0.1:8765`): This connection is HTTP. Loopback
  (`127.0.0.1`) is a W3C Trustworthy Origin so browsers do not block it as mixed content when the
  frontend is served over HTTPS. This is acceptable for a local-only service.
- **Production CA**: `make_dev_certs.py` generates a self-signed development CA. In production,
  a certificate from a trusted CA (e.g. Let's Encrypt) or an internal PKI should be used.
- **Flower `max_retries` / `max_wait_time`**: Set to `max_retries=1, max_wait_time=2.0` in the
  bounded negative tests (wrong CA, insecure client) to prevent hangs. Production connections should
  use higher values appropriate to network conditions.

---

## Future Work

- **mTLS**: Issue hospital-specific client certificates and verify them in the Flower server's
  `verify_identity` callback, replacing the bearer-token-over-gRPC approach.
- **Certificate rotation without downtime**: Use `SSLContext.load_cert_chain` with SIGHUP to reload
  certificates without restarting the process.
- **OCSP stapling / CRL checking**: Add `ctx.verify_flags = ssl.VERIFY_X509_STRICT` and an OCSP
  responder for revocation.
- **Automated cert renewal**: Integrate with Let's Encrypt / ACME for automatic renewal in production.
- **HSTS header**: Add `Strict-Transport-Security` to all backend responses once TLS is mandatory.

---

## Verification

All tests pass on the `module-10-dp` branch (no regressions):

### Backend Tests (`cd backend && npm test`)

| Suite | Tests | Result |
|-------|-------|--------|
| `tls.test.js` (new) | 4 | ✅ |
| `auth.test.js` | 45 | ✅ |
| `federation.test.js` | 103 | ✅ |
| `module_1_2_3_full.test.js` | 29 | ✅ |
| `training_progress.test.js` | 6 | ✅ |
| **Total** | **187** | **✅ all pass** |

TLS-specific tests:
- `creates standard HTTP server by default when TLS is disabled`
- `refuses to start when TLS is enabled but cert or key path is missing`
- `refuses to start when TLS certificate file does not exist`
- `creates HTTPS server with explicit TLSv1.2 when valid cert and key are provided`

### Hospital Client Tests (`python -m pytest hospital_client -q`)

| Suite | Tests | Result |
|-------|-------|--------|
| `test_tls.py` (new) | 5 | ✅ |
| `test_server.py` | 101+ | ✅ |
| All other suites | 755+ | ✅ |
| **Total** | **863** | **✅ 861 pass, 2 skip** |

TLS-specific tests:
- `test_security_warning_on_remote_http` — warning for remote HTTP, no warning for loopback or HTTPS
- `test_ssl_context_enforces_ca` — missing CA file raises ApiError(500); valid CA returns enforced SSLContext
- `test_backend_urlopen_with_trusted_ca` — HTTPS request to mock server succeeds with correct CA
- `test_backend_urlopen_with_wrong_ca_fails` — untrusted CA raises ApiError(502) with SAN guidance
- `test_rule_1_flower_no_silent_downgrade` — r_flower_connect raises ApiError(400) if backend is HTTPS but no CA

### Federation Tests (`python -m pytest federation/tests -q`)

| Suite | Tests | Result |
|-------|-------|--------|
| `test_flower_tls.py` (new) | 3 | ✅ |
| All existing suites | 139 | ✅ |
| **Total** | **142** | **✅ all pass** |

TLS-specific tests:
- `test_flower_tls_round_success` — full FL round over gRPC+TLS with dev certs
- `test_flower_tls_wrong_ca_fails_bounded` — wrong CA: client fails within 10 s (bounded by max_retries=1)
- `test_flower_tls_insecure_client_fails_bounded` — insecure client vs TLS server: fails within 10 s

> **Note on warnings in bounded tests**: The Flower server background threads raise
> `ValueError: signal only works in main thread` when `fl.server.start_server` is called from a
> non-main thread. This is a pytest thread-isolation artifact that does not occur in production
> (where `flower_app.__main__` runs in the main thread). All 3 tests pass.
