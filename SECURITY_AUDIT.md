# Security Policy

## Security Audit

Pare underwent a structured penetration test conducted by its author prior to production deployment. The audit covered the **OWASP Top 10 (2025)** and included both automated scanning and manual exploitation attempts.

### Methodology

- **Reconnaissance** — port scanning (nmap), HTTP fingerprinting, header analysis
- **Automated scanning** — OWASP ZAP
- **Manual testing** — Burp Suite, custom Python scripts, curl
- **Tools used** — Kali Linux, nmap, Burp Suite, OWASP ZAP, hydra, Python `requests`
- **Environment** — local VPS running the production Docker Compose configuration

---

## OWASP Top 10 (2025) Coverage

| # | Category | Result |
|---|----------|--------|
| A01 | Broken Access Control | ✅ Passed |
| A02 | Security Misconfiguration | ✅ Passed |
| A03 | Software Supply Chain Failures | ✅ Passed |
| A04 | Cryptographic Failures | ✅ Passed |
| A05 | Injection | ✅ Passed |
| A06 | Insecure Design | ✅ Passed |
| A07 | Authentication Failures | ✅ Passed |
| A08 | Software and Data Integrity Failures | ✅ Passed |
| A09 | Security Logging and Alerting Failures | ✅ Passed |
| A10 | Mishandling of Exceptional Conditions | ✅ Passed |

"The OWASP Top 10 assessment was focused on primary attack vectors relevant to the current architecture."

---

## Findings and Mitigations

### Critical / High

**Refresh token stored as plain text**
- **Finding** — Refresh tokens were stored in the database without hashing. A database leak would have allowed direct session hijacking — confirmed by manually extracting a token and authenticating as another user.
- **Fix** — Tokens are now hashed with SHA-256 before storage. The raw token is only ever held in memory during the request lifecycle.

**No rate limiting on authentication endpoints**
- **Finding** — The `/api/auth/login` endpoint had no brute force protection. A Python script using `rockyou.txt` successfully discovered a weak test password.
- **Fix** — IP-based rate limiting applied to all auth endpoints. Repeated failures trigger a temporary block with a `429 Too Many Requests` response. Blocked attempts are logged with IP address and path.

**DoS via request flooding**
- **Finding** — The server became unresponsive under ~50 concurrent connections with no request throttling in place.
- **Fix** — Global rate limiting applied at the reverse proxy level. During a flood test the server remained responsive for legitimate users while blocked requests received `429` responses.

**Currency API key exposed in frontend bundle**
- **Finding** — The third-party currency conversion API key was prefixed with `VITE_`, causing it to be embedded in the compiled JavaScript bundle and visible to anyone opening DevTools.
- **Fix** — All currency conversion requests are now proxied through the backend. The API key lives only in server-side environment variables and is never sent to the client. Responses are cached for 24 hours to minimize external API calls.

### Medium

**Missing HTTP security headers**
- **Finding** — Responses lacked `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, and `Content-Security-Policy`.
- **Fix** — All headers added via Caddy configuration. Server version header suppressed.

**No subscription limit**
- **Finding** — A script could create hundreds of subscriptions per user, exhausting database resources.
- **Fix** — Users are limited to 50 active subscriptions. Requests exceeding this return `422 Unprocessable Entity`.

**No rate limiting on Hangfire dashboard**
- **Finding** — The Hangfire admin dashboard had no brute force protection on its Basic Auth login.
- **Fix** — Rate limiting applied. After several failed attempts the IP is temporarily blocked.

**Insufficient security logging**
- **Finding** — Failed login attempts were logged only as generic command invocations with no IP address or email context, making it impossible to detect or investigate attacks.
- **Fix** — Authentication failures now log the IP address, path, and a structured warning event. Rate limit violations are also logged.

**Outdated npm dependencies with known vulnerabilities**
- **Finding** — `pnpm audit` reported 16 high-severity vulnerabilities across `vite`, `axios`, `react-router`, and transitive dependencies.
- **Fix** — All packages updated to current versions. Audit now reports zero high-severity issues.

### Low / Accepted Risk

**`alg: none` JWT attack**
- **Finding** — Tested by constructing a JWT with `"alg": "none"` and a modified payload. The server correctly rejected it with `401 invalid_token — the signature is invalid`.
- **Status** — Not vulnerable ✅

**IDOR (Insecure Direct Object Reference)**
- **Finding** — Attempted to read, modify, and delete another user's subscriptions using a different user's JWT token.
- **Status** — Not vulnerable ✅. All resource lookups are scoped to the `userId` extracted from the JWT on the server side. User-supplied IDs are ignored.

**SQL injection**
- **Finding** — Payloads including `' OR '1'='1` and `; DROP TABLE subscriptions;--` submitted via API fields. OWASP ZAP also flagged a false positive on the subscriptions endpoint.
- **Status** — Not vulnerable ✅. EF Core uses parameterized queries for all database operations.

**XSS (Cross-Site Scripting)**
- **Finding** — `<script>alert(1);</script>` injected into subscription name fields via both the UI and direct API calls.
- **Status** — Not vulnerable ✅. React escapes all rendered content by default. No `dangerouslySetInnerHTML` usage in the codebase.

**JWT valid after logout (accepted risk)**
- **Finding** — After logout, an access token remains valid until its 15-minute expiry. A stolen token could be used within this window even after the user has signed out.
- **Decision** — The complete fix requires a token blacklist (e.g. Redis), which adds latency to every authenticated request. Given the short expiry window and the scope of this project, this is accepted as a known trade-off. Refresh tokens are invalidated immediately on logout.

**Race condition on subscription limit**
- **Finding** — Sending 10 concurrent creation requests when a user had 49/50 subscriptions resulted in 53 total subscriptions, bypassing the limit.
- **Status** — Known issue. Fix requires pessimistic locking or a database-level constraint. Scheduled for a future release.

---

## Implemented Security Controls

- HTTPS enforced via Caddy with automatic TLS (Let's Encrypt in production)
- JWT authentication with short-lived access tokens (15 min) and rotating refresh tokens
- Refresh tokens hashed with SHA-256 before storage
- HttpOnly, Secure cookies for refresh token delivery
- IP-based rate limiting on all authentication and admin endpoints
- Subscription limit enforced server-side (50 per user)
- All database queries via EF Core (parameterized — no raw SQL)
- Security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- Server version header suppressed
- Swagger UI disabled in production
- Hangfire dashboard protected with Basic Auth + rate limiting
- Structured security logging (failed logins, rate limit events) with IP context
- Currency API proxied through backend — key never exposed to client
- Firewall configured to expose only ports 2222, 80, and 443
- Access to SSH can only be accessed with an SSH key. Login to the SSH via password is disabled
