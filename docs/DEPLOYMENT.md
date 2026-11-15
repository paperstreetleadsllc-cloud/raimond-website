# Deployment

Nothing here has been deployed. Production stays on `main` until this is approved.

## One-time setup

1. **Database.** Run `supabase/migrations/0001_audits.sql` in the Supabase SQL editor. It only adds two tables.
2. **Vercel environment variables** (Preview and Production):
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (already present if the waitlist function works)
   - `IP_HASH_SALT`: any long random string
   - `NEXT_PUBLIC_SITE_URL`: `https://raimondai.com`
3. **Vercel project settings.** Framework preset must be Next.js (`vercel.json` requests this). Root directory: repository root. Node 22.

## Preview

Pushing `feat/aeo-platform` creates a preview deployment. Use it to run the first real-site audits.

## Production checklist

- [ ] Migration applied
- [ ] Three real-site audits completed on the preview and recorded in `TESTING.md`
- [ ] Results page reviewed on a phone
- [ ] Privacy policy and terms reviewed by the owner
- [ ] `support@raimondai.com` receives mail
- [ ] Decision made on the existing trading waitlist page
- [ ] Merge to `main`

## Rollback

Redeploy the previous production deployment from the Vercel dashboard. No database rollback is needed.
