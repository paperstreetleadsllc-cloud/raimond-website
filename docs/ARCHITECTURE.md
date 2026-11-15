# Architecture

One Next.js application deployed on Vercel, with Supabase Postgres for storage.

## Request flow for an audit

1. `POST /api/audits` validates the address, applies rate limits, and looks for a recent audit of the same site.
2. A new audit row is created with status `queued`. The response returns its id immediately.
3. The work runs after the response is sent (`after()`), inside the same function invocation, with a 60-second ceiling. The crawl budget is 40 seconds.
4. The pipeline writes real progress events to the row: current stage, stages finished, pages fetched of pages planned.
5. The browser polls `GET /api/audits/:id` and renders progress, then the report.

An audit left `queued` or `running` with no update for two minutes is reported as failed, so the page never spins forever.

## Audit engine (`src/lib/audit`)

| Module | Responsibility |
|---|---|
| `url.ts` | Normalize input; reject non-http schemes, IP literals, internal names, non-standard ports |
| `net.ts` | `safeFetch`: connection-time DNS checks, manual redirects, timeout, size cap |
| `robots.ts` | robots.txt parsing (RFC 9309 matching), AI crawler access, sitemap parsing |
| `crawl.ts` | Page selection and fetching within limits |
| `extract.ts` | HTML to structured facts. No network access |
| `business.ts`, `industries.ts` | Name, industry, services, location, each with its source |
| `score.ts` | Checks and the configurable scoring model |
| `recommendations.ts` | Recommendations derived from failed checks |
| `prompts.ts` | Customer questions; provider statuses |
| `pipeline.ts` | Orchestrates the above |

The engine takes its fetcher as a parameter, so tests run the whole pipeline against in-memory websites.

## Decisions recorded

- **`after()` instead of a queue for Phase 2.** A free audit finishes inside one function invocation, so a queue would add infrastructure without adding reliability yet. Paid audits and recurring work (Phases 6-7) need durable jobs; the `processAudit(id)` function is already idempotent so it can be called from a queue worker unchanged.
- **Adding an industry is a data change.** Nothing outside `industries.ts` is niche-specific.
- **Scoring weights are data.** `scoreReadiness` accepts a config; an admin UI can supply it later.
