# Security Audit Design — College Sach

**Date:** 2026-04-02
**Approach:** Red Team / Blue Team (Approach C)

## Overview

Three-phase security audit for the College Sach website:
1. Red Team agent audits the full codebase — produces a ranked vulnerability report
2. User reviews the report and approves fixes
3. Blue Team agent fixes all approved items in parallel worktrees

**Step 0 (Immediate):** Rotate MongoDB password on Atlas — credentials `college:truth` are already in public git history and actively exploitable.

## Phase 1: Red Team Audit

**Agent type:** Research-only (no code modifications)
**Output:** `docs/security/red-team-report.md`

### Audit Scope

| Area | Files | Checks |
|------|-------|--------|
| Hardcoded Secrets | `scrapers/*.py` (all 4 + `run_scrapers.py`), `src/lib/seed.ts` | MongoDB URI with username:password in source code pushed to GitHub |
| Admin Auth | All 6 routes in `src/app/api/admin/` | Every route must call `verifyAdmin()`. Check for inline auth duplication (e.g. `stats/route.ts` has its own `checkAuth()`). |
| Public Route Auth | `api/scrape/ingest`, `api/submissions`, `api/submissions/[id]`, `api/search`, `api/posts` | Can anyone POST/PATCH data without authentication? |
| Auto-Trust | `api/scrape/ingest` | Does it set `verified: true` + `isApproved: true` on ingested posts? |
| Input Validation | `api/submissions/route.ts`, `api/submissions/[id]/route.ts`, `api/search/route.ts`, `api/scrape/ingest/route.ts` | NoSQL injection via unsanitized params, XSS in stored content |
| Rate Limiting | All 16+ API routes | No rate limiter exists currently |
| Security Headers | `next.config.ts` | Missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| CORS | `next.config.ts`, API routes | Is the API callable from any origin? |
| Error Leakage | All API routes returning `error.message` | MongoDB errors can reveal schema details and query structure |
| Auth Implementation | `src/lib/admin-auth.ts` | Token comparison uses `===` (not timing-safe); should use `crypto.timingSafeEqual()` |
| Dependencies | `package.json` | `npm audit` for known CVEs |
| MongoDB Config | Connection setup | IP whitelist, auth mechanisms |
| Incidents/Colleges Routes | `api/incidents/`, `api/colleges/[slug]/incidents/` | Missing from original scope — need audit |

### Severity Levels

- **P0 (Critical):** Hardcoded credentials, authentication bypass — fix immediately
- **P1 (High):** Missing input validation, NoSQL injection vectors, auto-trust — fix before launch
- **P2 (Medium):** Missing security headers, rate limiting, CORS, error leakage — fix soon

## Phase 2: User Review

User reviews `docs/security/red-team-report.md` and approves/rejects/deprioritizes findings before any code changes.

## Phase 3: Blue Team Fixes

**Agent type:** Implementation agents in parallel worktrees
**Output:** `docs/security/blue-team-fixes.md`

### Fix Groups (in priority order)

#### P0 — Secrets (Critical)
- Move hardcoded MongoDB URI in all scrapers (`news_scraper.py`, `reddit_scraper_v2.py`, `reddit_scraper.py`, `review_scraper.py`, `run_scrapers.py`) to environment variables via `os.environ` with `.env` fallback using `python-dotenv`
- Remove hardcoded localhost fallback in `src/lib/seed.ts`
- Add `scrapers/.env` to `.gitignore`
- Create `scrapers/.env.example` with placeholder template
- Check if `.env` is already in `.gitignore` at project root
- **User action required:** Rotate MongoDB password on Atlas immediately, update Vercel env vars and local `.env`

#### P0 — Auth Gaps (Critical)
- Verify every admin route calls `verifyAdmin()` — fix `stats/route.ts` which has inline `checkAuth()` with weaker matching
- Lock down `api/scrape/ingest` endpoint with `verifyAdmin()` auth
- Add `verifyAdmin()` to `api/submissions/[id]` PATCH route (currently completely unauthenticated — anyone can approve submissions and inject posts)
- Remove auto-trust: `scrape/ingest` should NOT set `verified: true` + `isApproved: true` by default
- Use `crypto.timingSafeEqual()` in `admin-auth.ts` instead of `===` for token comparison

#### P1 — Input Validation (High)
- Add Zod schemas for all POST/PATCH endpoints (submissions, search, scrape/ingest)
- Sanitize user-submitted content to prevent stored XSS (strip HTML/script tags)
- Validate MongoDB ObjectId parameters to prevent NoSQL injection
- Validate query parameters (slug, search terms) — alphanumeric + hyphens only for slugs

#### P1 — Rate Limiting (High)
- Use Vercel-compatible rate limiting (NOT in-memory Map — serverless functions are stateless)
- Option A: Use `@upstash/ratelimit` with Upstash Redis (free tier available)
- Option B: Use Next.js Edge middleware with simple IP-based sliding window backed by Vercel KV
- Option C: Lightweight header-based rate limit hints with Vercel's built-in edge caching
- Limits: 30 req/min for read endpoints, 5 req/min for write endpoints (submissions)

#### P2 — Security Headers (Medium)
- Add to `next.config.ts`: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy
- Configure CORS: allow only the production domain

#### P2 — Error Sanitization (Medium)
- Replace `error.message` in API responses with generic error messages
- Log full errors server-side only

#### P2 — Dependencies (Medium)
- Run `npm audit` and fix any known vulnerabilities
- Update outdated packages if needed

## Execution Plan

1. **Step 0:** User rotates MongoDB password on Atlas (immediate)
2. Dispatch red team agent → produces report
3. Present report to user → get approval
4. Dispatch blue team agents in parallel worktrees:
   - Agent 1: P0 secrets + auth gaps
   - Agent 2: P1 input validation + rate limiting
   - Agent 3: P2 headers + error sanitization + CORS + deps
5. Review and merge all worktrees
6. Push to GitHub/Vercel

## Files That Will Be Modified

- `scrapers/news_scraper.py` — remove hardcoded MONGO_URI
- `scrapers/reddit_scraper_v2.py` — remove hardcoded MONGO_URI
- `scrapers/reddit_scraper.py` — remove hardcoded MONGO_URI
- `scrapers/review_scraper.py` — audit for hardcoded secrets
- `scrapers/run_scrapers.py` — audit for hardcoded secrets
- `scrapers/.env.example` — new file with template
- `.gitignore` — add scrapers/.env
- `src/lib/seed.ts` — remove localhost fallback
- `src/lib/admin-auth.ts` — timing-safe comparison
- `src/app/api/admin/stats/route.ts` — replace inline auth with verifyAdmin()
- `src/app/api/admin/*/route.ts` — auth verification audit
- `src/app/api/scrape/ingest/route.ts` — add auth + remove auto-trust
- `src/app/api/submissions/[id]/route.ts` — add auth to PATCH
- `src/app/api/submissions/route.ts` — add Zod validation
- `src/app/api/search/route.ts` — add input sanitization
- `src/lib/rate-limit.ts` — new rate limiter utility
- `src/lib/validate.ts` — new Zod schemas
- `next.config.ts` — security headers + CORS
- All API routes — sanitize error messages
