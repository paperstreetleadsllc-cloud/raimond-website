# Operations

## Logs

Structured JSON lines in the Vercel function logs:

| Event | Meaning |
|---|---|
| `audit_completed` | Includes site, duration, pages, score |
| `audit_failed` | Includes site and error code |
| `store_not_configured` | Supabase variables are missing in a deployed environment |
| `audit_request_error`, `audit_read_error`, `lead_save_error` | Unexpected failures |

## Common situations

- **Audits return "temporarily unavailable".** Supabase variables are missing or wrong.
- **A site owner asks not to be crawled.** Point them to `/bot`; the crawler obeys `User-agent: RAimondAIBot`.
- **Free audits hit capacity.** The daily cap is `FREE_LIMITS.auditsPerDayGlobal` in `src/lib/service.ts`.
- **Delete an audit or a lead.** Remove the row in Supabase; leads cascade with their audit.

## Not yet in place

Alerting, dashboards, scheduled jobs, and an emergency stop for automated workflows (none exist yet to stop).
