# Implementation plan

## Phase 1 assessment (completed 2026-11-15)

**What existed on `main`**

- Root: Vite + React 18 single-page marketing site for the RAimond trading product, three Vercel functions (`waitlist`, `subscribe`, `join-beta`), Supabase used only for `waitlist_leads`, Resend for email, mock localStorage login.
- `apps/aeo-api`, `apps/aeo-web`: an earlier AEO prototype (Fastify API, JSON-file storage, Vite dashboard, Stripe scaffold) intended for a different domain.

**Why the prototype was not extended**

- The crawler had no SSRF protection and ignored robots.txt.
- It scored "citation likelihood" from a simulation. That presents a model's guess as visibility, which this product must never do.
- A long-running Fastify server with JSON-file storage cannot run on Vercel.
- It shipped seeded sample audit data.

It is preserved under `legacy/aeo-prototype` for reference (the Stripe routes are a useful starting point for Phase 5).

**Decisions**

| Decision | Reason |
|---|---|
| Rebuild as one Next.js app at the repo root | Server-rendered pages (a client-rendered site is a poor advert for discoverability), API routes and pages in one deployable unit, no microservices |
| Keep the Vercel project, Supabase project, and Resend | Already provisioned |
| New tables only; `waitlist_leads` untouched | No risk to existing data |
| Deterministic audit engine, no LLM in Phase 2 | Zero marginal cost per free audit; reproducible results |
| Store the audit result as JSONB for now | Normalized tables arrive with accounts in Phase 4, when they are needed |

**Rollback**

`main` is untouched. Production changes only when this branch is merged or promoted. To roll back, redeploy the previous production build in Vercel; the migration only adds tables, so nothing needs undoing.

## Checklist

### Phase 2: functional public audit
- [x] Homepage with URL input and conversion sections
- [x] URL validation and normalization
- [x] SSRF protection (private ranges, metadata endpoints, DNS rebinding, redirects)
- [x] Crawler honoring robots.txt, with page, size, and time limits
- [x] Sitemap discovery and parsing
- [x] Page extraction (metadata, headings, JSON-LD, contact details, trust signals)
- [x] Business identification (name, industry, services, location) with sources
- [x] Configurable AI Readiness Score with evidence
- [x] Recommendations with problem, evidence, impact, action, effort, priority, steps, verification
- [x] Customer question generation by intent
- [x] Audit storage (Supabase) and local file store
- [x] Background processing with real progress reporting
- [x] Results dashboard
- [x] Lead capture (stored; no email sent)
- [x] Rate limiting, de-duplication, honeypot, same-origin check
- [x] Automated tests
- [ ] Apply `supabase/migrations/0001_audits.sql` to the database
- [ ] Deploy a preview and audit three real business websites
- [ ] Bot protection challenge (e.g. Turnstile) if abuse appears
- [ ] Supporting marketing pages: /how-it-works, /features, /industries, /contact, /blog

### Phase 3: observed AI visibility
- [ ] Research each provider's official API and access terms
- [ ] Provider adapter interface and observation storage
- [ ] First genuinely supported observation source
- [ ] Mention, recommendation, citation, and competitor detection
- [ ] Evidence display with sample size and dates

### Later phases
- [ ] 4: Accounts, organizations, tenant isolation, audit history
- [ ] 5: Stripe (test mode), plans, entitlements, usage limits
- [ ] 6: Agents on durable workflows
- [ ] 7: Recurring optimization and reporting
- [ ] 8: Prospecting, CRM, content pipeline
- [ ] 9: Production readiness review
