# Pare

> You probably pay for more than you think.

A subscription manager I built to track what I'm actually spending on recurring services — clean architecture on the backend, background jobs, and a security audit before launch.

---

## What it does

<p>
    <img src="https://github.com/user-attachments/assets/0931b7e1-d1ab-4850-a62d-c6c3ae50c1bb" width="49%" />
    <img src="https://github.com/user-attachments/assets/4b791461-794b-4050-a0fd-240122e87da3" width="49%" />
</p>

- Track subscriptions across different billing cycles (monthly, yearly, weekly)
- Multi-currency support with live exchange rates (proxied through the backend)
- Email reminders 3 days before a renewal
- Analytics: monthly spend, yearly projection, billing cycle breakdown
- Dashboard with upcoming payments sorted by date

---

## Stack

**Backend** — ASP.NET Core 10, Clean Architecture (`Domain` / `Application` / `Infrastructure` / `API`), CQRS with MediatR, FluentValidation, EF Core + PostgreSQL 18, Hangfire for background jobs, Serilog, Resend for transactional email

**Frontend** — React 19 + Vite + TypeScript, Tailwind CSS v4, TanStack Query v5, Zustand, Recharts, React Router v7

**Infra** — Docker Compose (base / override / prod), Caddy as a reverse proxy with automatic TLS, GitHub Actions CI, Hetzner VPS

---

## Architecture

```
Pare.Domain          → Entities, enums, core logic
Pare.Application     → CQRS handlers, validators, interfaces, services
Pare.Infrastructure  → EF Core, repositories, JWT, BCrypt, email, jobs
Pare.API             → Controllers, middleware, DI wiring
```

Dependencies point inward: the domain knows nothing about EF Core, the application layer nothing about ASP.NET. `Application` defines the interfaces, `Infrastructure` implements them.

Every feature is a MediatR command or query with a co-located validator. DTOs are mapped manually (no AutoMapper).

---

## Auth

JWT access tokens (15 min) + rotating refresh tokens in `httpOnly`, `Secure`, `SameSite=Strict` cookies. Refresh tokens are SHA-256 hashed before storage, so a database leak can't be replayed as a session. The frontend queues concurrent 401s so only one refresh request is sent.

---

## Running locally

**Prerequisites:** Docker, .NET 10 SDK (for local dev without Docker)

```bash
git clone https://github.com/shimiio/pare
cd pare

cp .env.example .env
# fill in the values
```

```bash
# Start everything (DB, migrator, API, frontend, Caddy)
docker compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

The override file swaps Resend for Mailpit (local SMTP) and exposes the DB port. Email UI is at `http://localhost:8025`.

For local backend dev without Docker, fill in `backend/src/Pare.API/appsettings.Development.json` and run:

```bash
cd backend && dotnet run --project src/Pare.API
cd frontend && pnpm install && pnpm dev
```

**Environment variables** — see `.env.example` and `secrets.example.json` for what's needed.

---

## Tests

```bash
# Backend
dotnet test backend/

# Frontend
cd frontend && pnpm test:run
```

Backend: xUnit + Moq + FluentAssertions — unit tests for domain logic (billing date calculation), validators, and service behavior.

Frontend: Vitest — utility functions (dates, currency conversion and formatting, error extraction) and the shared loading/error components.

---

## Security

Before going live I ran a structured pen test covering the OWASP Top 10 (2025) — OWASP ZAP plus manual testing from Kali Linux. 13 findings, 10 fixed before deployment.

- Refresh tokens stored as plain text → SHA-256 hashed
- No rate limiting on auth endpoints → brute-forced a weak test password with `rockyou.txt` in under a minute
- Exchange rate API key in the Vite bundle → moved server-side with a 12h cache
- Missing security headers → added via Caddy config

A later code review found 5 more, including a registration race that allowed duplicate accounts. Full writeup in [`SECURITY_AUDIT.md`](./SECURITY_AUDIT.md).

---

## Deployment

Hetzner VPS, Caddy handles TLS automatically. Three-Compose-file setup:

```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d --build
```

Migrations run in a dedicated `migrator` container that exits before the API starts, so the schema is never half-applied while requests are served.

---

## What I'd do differently / what's next

- Integration tests against a real database (unit tests only, so far)
- Password reset
- PaymentHistory — planned as the first post-launch migration, to get real experience with live schema changes
- Race condition on the subscription limit: concurrent requests can exceed 50. Needs a DB-level constraint or pessimistic locking; accepted risk for now

---

Built by [Pavlo](https://github.com/shimiio)
