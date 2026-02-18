# RAimond Marketing & Trading OS

## Repo scope
- This repository is for the RAimond website (Vite/React) only.
- Do not copy unrelated projects into this folder.
- If you need a separate backend/project, create a separate repo folder.

## How to run the app
- Use Node 20 via nvm-windows (`nvm use 20.19.0`).
- Install dependencies with `npm install`
- Start the Vite dev server: `npm run dev`
- The site mounts at `http://localhost:5173` by default

## How login works
- The login form lives at `/login` and accepts any email/password or the “Continue with Gmail” button
- Successful login stores a mock session with the user email in `localStorage`
- Session state is provided to the app through `AuthProvider` / `useAuth`, so `logout()` clears the session everywhere

## Trading OS dashboard
- The authenticated dashboard lives at `/app` and is protected by `ProtectedRoute`
- UI components for the Trading OS experience are under `src/features/tradingOs/`
- Use the header or hero “Launch Trading OS” buttons to navigate there after logging in

## Hybrid stack (site + AEO Visibility OS API)
- This repo now supports a hybrid local stack:
  - Frontend dashboard UI via the existing Vite app
  - Backend API scaffolding at `apps/aeo-api` (Fastify + TypeScript)
- Install dependencies at the root: `npm install`
- Run only the website: `npm run dev:site`
- Run only the API service: `npm run dev:api`
- Run only the standalone AEO web app: `npm run dev:aeo`
- Run both together: `npm run dev:all`
- Default API health endpoint: `http://localhost:4000/health`

## Standalone AEO web app
- New isolated frontend workspace: `apps/aeo-web`
- This app does not mount inside the main RAimond routes/pages; it runs as its own Vite app.
- Configure API base URL in `apps/aeo-web/.env`:
  - `VITE_AEO_API=http://localhost:4000`
- Local run order:
  - `npm install`
  - `npm run dev -w apps/aeo-api`
  - `npm run dev -w apps/aeo-web`

## AEO billing scaffold (Stripe)
- Backend endpoints in `apps/aeo-api`:
  - `POST /billing/create-checkout-session`
  - `GET /billing/customer-portal?email=...`
  - `POST /billing/webhook`
- Temporary billing identity is keyed by email in local JSON store (`billing-customers.json`).
- Required env vars:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `VITE_AEO_API`
- Frontend pricing page: `/pricing`

### Local Stripe CLI testing
1. Set env vars in `.env.local`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`
   - `VITE_AEO_API=http://localhost:4000`
2. Start local stack:
   - `npm run dev:all`
3. Start Stripe webhook forwarding (new terminal):
   - `stripe listen --forward-to localhost:4000/billing/webhook`
4. Copy the webhook signing secret printed by Stripe CLI into:
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
5. Open pricing page and run checkout:
   - `http://localhost:5173/pricing`
6. Trigger webhook test events (optional):
   - `stripe trigger checkout.session.completed`
   - `stripe trigger customer.subscription.updated`
7. Verify API responses:
   - Checkout creates a redirect URL from `/billing/create-checkout-session`
   - Portal URL resolves from `/billing/customer-portal?email=...`
   - Webhook calls return `{"received":true}`

### TODO: auth migration to Supabase
- Replace email-only billing association with authenticated Supabase user IDs.
- Persist `user_id -> stripe_customer_id` in Postgres (instead of temporary JSON files).
- Restrict checkout and portal actions to the current signed-in user.








