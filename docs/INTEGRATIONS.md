# Integrations

| Service | Purpose | State | Configuration needed |
|---|---|---|---|
| Supabase | Audit and lead storage | Code complete, not yet run against the live database | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, apply migration |
| Vercel | Hosting | Project exists | Environment variables above |
| Resend | Email | Not wired into the new app. Lead requests are stored, no email is sent | Approval to send, then `RESEND_API_KEY` |
| Stripe | Billing | Not started (Phase 5) | Test-mode keys |
| AI search providers | Observed visibility | Not started (Phase 3). No provider is queried | Per-provider API access, to be researched |
| Analytics | Site analytics | Not added | Choice of provider |
| Error tracking | Monitoring | Not added; structured logs only | Choice of provider |

Nothing in this table is reported as working unless it has been run.
