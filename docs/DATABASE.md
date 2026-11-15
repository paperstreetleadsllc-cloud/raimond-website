# Database

Supabase Postgres. Migrations live in `supabase/migrations` and are additive.

## Current tables

**`audits`**: one row per audit. `site_key` (hostname without `www`), `input_url`, `status`, `progress` (JSONB), `result` (JSONB, the full report), `error` (JSONB), `ip_hash`, timestamps.

**`audit_leads`**: report requests. `audit_id`, `email`, `name`, `ip_hash`. Unique on `(audit_id, email)`.

**`billing_customers`**, **`stripe_webhook_events`**: see [AUTH_BILLING.md](AUTH_BILLING.md).

**`waitlist_leads`**: pre-existing, from the trading site. Not modified.

Row-level security is enabled on the new tables with no policies; access is server-only.

## Planned (Phase 4 onward)

`users`, `organizations`, `organization_members`, `websites`, `website_pages`, `audit_findings`, `readiness_scores`, `search_prompts`, `search_observations`, `ai_providers`, `competitors`, `recommendations`, `optimization_tasks`, `content_drafts`, `agent_definitions`, `agent_runs`, `agent_logs`, `approval_requests`, `subscriptions`, `usage_records`, `leads`, `lead_events`, `integrations`, `reports`, `notifications`, `billing_events`.

These arrive with accounts, when tenant isolation policies can be written and tested against real roles. The JSONB report maps directly onto `audit_findings`, `readiness_scores`, `recommendations`, and `search_prompts`.
