# Testing

`npm test` runs everything. No network access is needed: the pipeline runs against in-memory websites.

## What is covered

| Area | File |
|---|---|
| Valid and invalid URLs; SSRF targets in many encodings; address-range blocking; connection-time DNS refusal | `tests/url-ssrf.test.ts` |
| robots.txt matching, AI crawler detection, sitemap parsing, HTML extraction | `tests/robots-extract.test.ts` |
| Full pipeline: good site, weak site, redirects, unreachable site, http fallback, error status, robots disallow, robots error, non-HTML, large site, slow pages, broken links, oversized pages, custom scoring, determinism | `tests/pipeline.test.ts` |
| Duplicate and concurrent audits, rate limits, failure recording, stalled audits, database failure, missing credentials, free-tier limits | `tests/service.test.ts` |
| Visibility detection: mention, narrow recommendation rule, citation, competitors, look-alike domains, empty samples | `tests/visibility-detect.test.ts` |
| Checkout, portal, subscription state, price allowlist, live-mode lock | `tests/billing-service.test.ts` |
| Webhook signatures (real Stripe verification), duplicates, out-of-order, retries, no email matching | `tests/billing-webhook.test.ts` |
| Billing endpoints: unauthenticated, expired session, cross-site, forged ids | `tests/billing-routes.test.ts` |
| Row-level security and constraints, run on the real migration SQL in an in-process Postgres | `tests/billing-rls.test.ts` |
| Legacy customer migration proposals and approval | `tests/billing-legacy.test.ts` |
| Password policy, email validation, safe redirects | `tests/auth-rules.test.ts` |
| Results dashboard renders from real pipeline output; no platform shows a figure | `tests/report-render.test.tsx` |

## Latest run (2026-11-15, development sandbox)

- Automated tests: 178 passed, 0 failed.
- Type check: passed.
- Production build: passed.
- Local server: all pages returned 200; invalid, SSRF, cross-origin, honeypot, rate-limit, and lead requests behaved as designed.

## Not yet executed

**Real-website audits.** The development sandbox has no outbound internet access, so the crawler has not yet fetched a live site. One attempt was made (`mrrooter.com`) and failed at the network layer, as expected there. This must be run from a deployed preview or a developer machine:

```bash
npm run audit:site -- https://<business-site>
```

Record for each site: completion status, pages analyzed, verified findings, processing time, cost, errors.

Also not yet tested: real sign-up, email confirmation, login, password reset, Stripe checkout and portal (these need the Supabase and Stripe test projects configured on a preview); Supabase store against a live database, mobile and accessibility review in a browser, load behaviour.
