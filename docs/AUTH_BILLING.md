# Authentication and billing

Every customer has a Supabase Auth account. Every Stripe record is tied to that account's user id. Email addresses are contact details only and are never used to decide who owns a subscription.

## What the old system did (and why it was replaced)

The earlier prototype (`legacy/aeo-prototype/aeo-api/src/routes/billing.ts`) had no login:

| Old behaviour | Risk |
|---|---|
| Checkout took an `email` from the request body | Anyone could start checkout as any address |
| `GET /billing/customer-portal?email=...` | Anyone who knew a customer's email could open that customer's billing portal |
| Webhooks matched subscriptions to records by email | A subscription could attach to the wrong record |
| Mappings stored in `data/billing-customers.json` | Not durable on serverless hosting; no access control |
| Prices built inline from a plan name | No link to real Stripe prices |

The committed `billing-customers.json` contains **zero records**, so there is nothing in the repository to migrate. If the old API ever ran with live Stripe keys, customers may exist in the Stripe account; see "Migrating existing customers".

## How it works now

- **Sessions** are Supabase Auth cookies, refreshed by `src/proxy.ts`. Every protected page and API route calls `supabase.auth.getUser()`, which validates the token with Supabase rather than trusting the cookie.
- **Checkout** (`POST /api/billing/checkout`) reads one thing from the browser: a plan name. The user comes from the verified session, the customer from Postgres, the price from a server-side allowlist, and the return URLs from server configuration.
- **Portal** (`POST /api/billing/portal`) reads nothing from the browser. It looks up the signed-in user's own customer.
- **Webhooks** (`POST /api/billing/webhook`) verify Stripe's signature on the raw body, record each event id once, and then copy the customer's current state from Stripe. Because the state is always re-read from Stripe, duplicate, late, and out-of-order events all converge on the correct result.
- **Live mode is locked.** A live Stripe key is refused, and live events are ignored, unless `BILLING_LIVE_MODE_APPROVED=true`.

## Database schema

Migration: `supabase/migrations/0002_billing.sql` (additive; safe to run twice).

**`billing_customers`**

| Column | Notes |
|---|---|
| `user_id` | Primary key. Foreign key to `auth.users(id)`, `ON DELETE RESTRICT` so billing history cannot vanish with an account |
| `stripe_customer_id` | Unique, must look like `cus_...` |
| `stripe_subscription_id` | Unique when present |
| `subscription_status` | `none`, `incomplete`, `incomplete_expired`, `trialing`, `active`, `past_due`, `canceled`, `unpaid`, `paused` |
| `plan`, `price_id` | Plan is set only when the price is on the allowlist |
| `current_period_end`, `cancel_at_period_end`, `livemode`, `synced_at` | From Stripe |
| `created_at`, `updated_at` | `updated_at` maintained by trigger |

**`stripe_webhook_events`**: `event_id` (primary key), `type`, `livemode`, `stripe_created`, `received_at`, `processed_at`, `attempts`, `last_error`.

**Access rules**

- Row-level security is on for both tables.
- Signed-in users can `SELECT` their own `billing_customers` row and nothing else.
- All table privileges are revoked from the `anon` and `authenticated` roles except that one `SELECT`. Customers cannot insert, update, or delete, so they cannot change a Stripe id or a status.
- `stripe_webhook_events` has no policies. Only the service role can read or write it.
- Writes happen only in server code using the service-role key.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server | Public key; safe to expose, RLS protects data |
| `SUPABASE_URL` | Server | Same project URL (already used by audits) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Trusted writes. Never prefix with `NEXT_PUBLIC_` |
| `STRIPE_SECRET_KEY` | Server only | Use a `sk_test_...` key |
| `STRIPE_WEBHOOK_SECRET` | Server only | `whsec_...` for this deployment's endpoint |
| `STRIPE_PRICE_MONITOR`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_AUTHORITY` | Server only | The price allowlist. A plan with no price shows "Opening soon" |
| `NEXT_PUBLIC_SITE_URL` | Both | Production base URL. Previews use Vercel's branch URL automatically |
| `BILLING_LIVE_MODE_APPROVED` | Server only | Leave unset. Set to `true` only when live billing is approved |

## Supabase dashboard steps

1. **SQL editor:** run `0001_audits.sql` (if not yet applied), then `0002_billing.sql`.
2. **Authentication > Sign In / Providers > Email:** enable Email, turn on **Confirm email**, turn on **Secure password change**, set minimum password length to 10.
3. **Authentication > URL Configuration:** Site URL `https://raimondai.com`. Add redirect URLs `https://raimondai.com/auth/confirm`, `http://localhost:3000/auth/confirm`, and the Vercel preview pattern for this project ending in `/auth/confirm`.
4. **Authentication > Emails > SMTP:** connect Resend (already in use). Supabase's built-in mailer is limited to a few emails per hour and is for testing only.
5. **Before production, update two email templates** so links work on any device:
   - Confirm signup: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`
   - Reset password: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery`
   The default templates also work, but only when the link is opened in the same browser that requested it.
6. **Project Settings > API:** copy the project URL and anon key into Vercel.
7. **Verify the policies** in the SQL editor: `select tablename, policyname, cmd, roles from pg_policies where schemaname = 'public';` should list exactly one policy, a `SELECT` on `billing_customers` for `authenticated`.

## Stripe dashboard steps (test mode)

1. Create three products with recurring monthly prices: Monitor $199, Growth $499, Authority $999. Copy each Price ID into the matching variable.
2. **Developers > Webhooks:** add `https://<preview-url>/api/billing/webhook` with events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `customer.subscription.paused`, `customer.subscription.resumed`, `invoice.paid`, `invoice.payment_failed`, `customer.deleted`. Copy the signing secret.
3. **Settings > Billing > Customer portal:** activate it in test mode and allow cancellation.

## Migrating existing customers

Nothing is linked automatically. The old JSON file is never changed or deleted.

```bash
npx tsx scripts/migrate-legacy-billing.ts plan path/to/billing-customers.json   # read-only; writes legacy-billing-review.json
# review the file; set "approved": true on rows you have checked
npx tsx scripts/migrate-legacy-billing.ts apply
```

A row can be applied only if the customer exists in Stripe, exactly one account has that email, the account's email is verified, the Stripe customer's email matches, and neither side is already linked. Approving a row that fails a check does nothing.

## Deploying safely

1. Merge nothing to `main` yet. Work stays on `feat/supabase-auth-billing`.
2. Apply the migrations and complete the dashboard steps above against the Supabase project.
3. Set the variables for the **Preview** environment in Vercel, using Stripe **test** keys.
4. On the preview: sign up, confirm by email, log in, subscribe with card `4242 4242 4242 4242`, open the portal, cancel, reset the password, log out.
5. In Stripe, resend a webhook event and confirm the log shows `duplicate`.
6. Only after that passes: set Production variables (still test keys), merge, and retest.
7. Live billing is a separate, explicit step: live keys plus `BILLING_LIVE_MODE_APPROVED=true`.

## Remaining concerns

- **The old API may still be deployed.** Vercel projects `raimond-website-aeo-api` and `raimond-website-aeo-api-nk8b` have production deployments from February. If they hold Stripe keys, the insecure email-based endpoints are live. Remove their Stripe variables or delete the projects.
- **Not yet run against real services.** Sign-up, email confirmation, login, password reset, real checkout, and the real portal need the Supabase and Stripe test projects configured. Access rules were tested in a real Postgres engine with stand-in Supabase roles, not on the hosted project; step 7 above confirms them there.
- **Email link scanners** in some mail systems open links automatically and can use up a one-time link. The user just requests another.
- **No bot challenge on sign-up, and no multi-factor authentication.** Supabase supports both; neither is enabled.
- **Deleting a user who has a billing record is blocked** by design. Account deletion needs a deliberate process: cancel in Stripe, then remove the mapping.
- **`stripe_webhook_events` grows forever.** Add a periodic prune (for example, older than 90 days).
- **The $99 one-time audit is not implemented.** Only the three subscriptions are.
- **The repository is public.** No secrets are committed, but all of this code is readable by anyone.
