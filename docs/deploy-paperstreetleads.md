# Deploy PaperStreetLeads Domains

This guide sets up a clean split for the AEO stack:

- `paperstreetleads.com` -> marketing/landing (optional)
- `app.paperstreetleads.com` -> AEO dashboard (`apps/aeo-web`)
- `api.paperstreetleads.com` -> AEO API (`apps/aeo-api`)

## 1) GoDaddy DNS records

Use the DNS values provided by your hosting vendors.

- `app` -> `CNAME` to your frontend host target
  - Example providers: Vercel, Netlify, Cloudflare Pages
- `api` -> `CNAME` to your API host target
  - Example providers: Render, Fly.io, Railway
- Root domain (`@`) -> provider-specific apex record
  - Use `A` records if provider gives static IPs
  - Use apex `CNAME`/ALIAS/ANAME if provider supports it

Notes:

- Do not create both conflicting `A` and `CNAME` records for the same host.
- Keep TTL low during initial cutover (for example, 600 seconds), then raise later.

## 2) Platform environment variables

### Frontend (`app.paperstreetleads.com`, `apps/aeo-web`)

Set in your frontend host project settings:

- `VITE_AEO_API=https://api.paperstreetleads.com`

For local development (not production), use a local override file in `apps/aeo-web`:

- `.env.local` with `VITE_AEO_API=http://localhost:4000`

### Vercel project settings for `paperstreetleads.com`

To make sure Vercel serves only the AEO web app (not the RAImond root app):

- Project repository must be `life-insurance-site` (this repo).
- Root Directory: leave blank or set to repo root (the root `vercel.json` controls build/output).
- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build -w apps/aeo-web`
- Output directory: `apps/aeo-web/dist`
- Environment variable: `VITE_AEO_API=https://api.paperstreetleads.com`

SPA routing for AEO pages (`/sites`, `/pricing`, `/sites/:id/audit`) is handled by the root `vercel.json` rewrite to `index.html`.

### API (`api.paperstreetleads.com`, `apps/aeo-api`)

Set in your API host project settings:

- `NODE_ENV=production`
- `API_HOST=0.0.0.0`
- `API_PORT` from your platform (or fixed if required)
- `FRONTEND_APP_URL=https://app.paperstreetleads.com`
- Billing vars if used:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`

CORS behavior in API:

- Allows `https://app.paperstreetleads.com`
- Allows local dev origins like `http://localhost:5173`, `http://localhost:5174`, etc.
- Allows non-browser calls (such as `curl`)

## 3) Deploy order

1. Deploy API first and confirm health.
2. Deploy frontend with `VITE_AEO_API` pointing to the API domain.
3. Point DNS records to provider targets.
4. Wait for DNS propagation and verify.

## 4) Verification commands

### API health

```bash
curl -i https://api.paperstreetleads.com/health
```

Expected response includes HTTP 200 and body similar to:

```json
{"status":"ok"}
```

### CORS check for app origin

```bash
curl -i https://api.paperstreetleads.com/sites \
  -H "Origin: https://app.paperstreetleads.com"
```

Expected headers include:

- `access-control-allow-origin: https://app.paperstreetleads.com`

### Browser checks

1. Open `https://app.paperstreetleads.com`
2. Navigate to `Sites`
3. Confirm site list loads from API (no CORS errors in DevTools console/network)
4. Confirm API calls target `https://api.paperstreetleads.com`

## 5) Health verification checklist

- [ ] `https://api.paperstreetleads.com/health` returns `{"status":"ok"}`
- [ ] `https://app.paperstreetleads.com` loads without runtime errors
- [ ] Sites page can request `GET /sites` successfully
- [ ] No CORS errors for requests from `https://app.paperstreetleads.com`
- [ ] Local API still runs at `http://localhost:4000`
- [ ] Local AEO web still runs on `http://localhost:517x` and can call local API

## 6) Windows install reliability (`EPERM` on `esbuild.exe`)

If `npm ci`/`npm install` fails with `EPERM: operation not permitted, unlink ...\@esbuild\win32-x64\esbuild.exe`:

1. Stop running Node processes (Vite/dev servers).
2. Close VS Code/Cursor terminals that are using Node in this repo.
3. Temporarily disable real-time antivirus scanning for the repo folder (or add an exclusion).
4. If still blocked, delete `node_modules` and `package-lock.json`, then run `npm install`.
