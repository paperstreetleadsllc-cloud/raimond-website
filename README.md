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








