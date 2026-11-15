# RAimondAI

AI search visibility audits for small and medium-sized businesses.

A visitor enters a business website and gets an evidence-backed **AI Readiness Score**, the three highest-value fixes, and the customer questions worth tracking. No account is needed.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Project discovery | Done |
| 2 | Public audit: homepage, crawler, scoring, results, lead capture, abuse protection | Built; awaiting first real-site run on a deployed preview |
| 3 | Observed AI visibility (provider integrations) | Not started. Every platform shows "Not currently measured" |
| 4-9 | Accounts, billing, agents, recurring work, acquisition, production hardening | Not started |

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the checklist.

## Run locally

```bash
npm install
npm run dev            # http://localhost:3000
npm test               # unit and integration tests, no network needed
npm run audit:site -- https://some-business.com   # run the engine from the terminal
```

With no Supabase variables set, local audits are stored as files under `.data/`. Copy `.env.example` to `.env.local` to use a real database.

## Layout

```
src/app/            Pages and API routes (Next.js App Router)
src/components/     UI, including the results dashboard
src/lib/audit/      The audit engine: URL safety, fetching, crawl, extraction, scoring
src/lib/store/      Storage: Supabase in production, files in local development
src/lib/service.ts  Rate limits, de-duplication, audit processing
supabase/migrations SQL to run against the database
tests/              Automated tests
legacy/             Earlier AEO prototype, kept for reference only (not built or deployed)
```

## Principles the code enforces

- **Readiness is not visibility.** The score describes the website. What AI products say is reported separately, and only from recorded observations.
- **No invented data.** If the industry, location, or name cannot be determined from the site, the report says so.
- **Every point has evidence.** Each check carries the facts it was scored on.
- **The free audit costs nothing to run.** It uses deterministic code and no paid API.
