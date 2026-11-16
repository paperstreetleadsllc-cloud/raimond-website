# RAimondAI status and handoff

Updated 2026-11-16. Read this first in any new working session.

## Where things live

- **Repo:** `paperstreetleadsllc-cloud/raimond-website` (public). Work happens on `feat/supabase-auth-billing` (PR #4 into `feat/aeo-platform`). `main` is the old site and is untouched. Never push to `main`.
- **Hosting:** Vercel team `paperstreetleadsllc-cloud`, project `raimond-website`. Production serves raimondai.com from `main`. Preview: `https://raimond-website-git-2242af-paperstreetleadsllc-clouds-projects.vercel.app`.
- **Database and sign-in:** Supabase project `wrgmcgbuodrqdsxjmixv` (org RAimond).
- **Payments:** Stripe sandbox, account "RAimondAi.com". Test mode only.
- **Docs:** `docs/` in the repo. Start with `ARCHITECTURE.md`, `AUTH_BILLING.md`, `MARKETING_PLAN.md`, `VISIBILITY_PROVIDERS.md`.

## Standing rules from Drew

- No push to `main`, no production deployment, no live billing, no paid API spend, no external messages, no publishing, no changes to customer sites without his explicit approval.
- Never fabricate visibility, leads, integrations or test results. Anything not measured shows "Not currently measured".
- Secrets are entered by Drew only. Never claim a test passed unless it ran.

## Built and working

- Free audit: crawl, six-category AI Readiness Score with evidence, recommendations. Tested live on five real sites.
- Sign-up, login, reset (Supabase Auth). Code complete; not yet tested end to end on the preview.
- Stripe subscriptions keyed to the Supabase user id: checkout, portal, verified webhooks. Sandbox has three products, a portal and a webhook. Not yet walked through.
- Saved audits on the dashboard (code complete; needs migration `0003_user_audits.sql` applied).
- Three guides, `llms.txt`, sitemap.

## Waiting on Drew

1. Paste `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` into Vercel (Preview only).
2. Create a test account on the preview `/signup` page.
3. Approve applying migration `0003_user_audits.sql` to Supabase.
4. Review the privacy and terms drafts.
5. Back up uncommitted February changes on his PC (`C:\Users\drews\Documents\raimond-website`).
6. Approve or change the $25 pilot cap for measuring AI visibility; create Perplexity and OpenAI API accounts.
7. Launch decisions listed in `MARKETING_PLAN.md`.

## Before the free-audit launch

- Supabase variables in Vercel Production; `NEXT_PUBLIC_SITE_URL` set.
- Check Vercel Hobby plan terms for commercial use.
- Resend SMTP for sign-up emails.
- "Request the full report" has no follow-up process.
- Scoring is too generous at the top (92 and 94 on two good sites); recalibrate on 20 to 30 sites.
- Analytics, error alerts, bot protection on forms.
- Vercel preview protection is OFF for the Stripe test; turn it back on afterwards.
- Close stale PRs #1 and #2.

## Before taking money

- Build what each plan sells: scheduled re-audits, measured AI visibility, the $99 audit and full report.
- Stripe business verification and live-mode setup by Drew. Live billing is locked in code until `BILLING_LIVE_MODE_APPROVED=true`.
