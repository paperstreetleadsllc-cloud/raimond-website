# Copilot instructions for RAimond (React + Vite + Tailwind)

Assumptions: this repository is a Vite-powered React app using TypeScript (or JavaScript) and TailwindCSS, with standard Vite project layout (root package.json, `index.html`, `src/`, `public/`, `vite.config.*`). If your project differs, point me to the correct root and I'll merge accordingly.

Guidance for AI coding agents (concise, actionable):

- Big picture
  - Frontend-only single-page app built with Vite + React. The app entry is usually `src/main.tsx` (or `src/main.jsx`) and the root component in `src/App.*`.
  - Tailwind styles are initialized in a CSS entry such as `src/index.css` or `src/styles/tailwind.css` and imported from the app entry.
  - Build and dev flow rely on `package.json` scripts: `dev` (vite), `build` (vite build), `preview` (vite preview). Use `npm install` then `npm run dev` to start.

- File & code conventions to follow
  - Component files live under `src/components/` and are small, function components (hooks + JSX/TSX). Keep props typed with TypeScript when the project uses `.ts/.tsx` files.
  - Styling: prefer Tailwind utility classes in JSX/TSX. For repeated patterns, create small CSS modules or Tailwind `@apply` rules in `src/styles/`.
  - Assets: `public/` contains static assets referenced by absolute paths (`/images/...`). `src/assets/` is for imports (bundled by Vite).
  - Routing (if present): look for `src/pages/`, `src/routes/` or `react-router` usage. Prefer client-side route components under `src/pages/`.

- Build / test / debug commands (examples)
  - Install: `npm ci` or `npm install`
  - Dev server: `npm run dev`
  - Production build: `npm run build`
  - Preview production build: `npm run preview`
  - Linting: `npm run lint` (often configured with ESLint)
  - Tests: `npm test` or `npm run test` / `vitest` if present

- Patterns & smells to follow or fix (project-specific examples)
  - Use the Vite import style for assets: `import logo from './assets/logo.svg'` not `require()`.
  - Prefer functional components and hooks. If you find class components or older lifecycle code, modernize only when tests exist or with a clear migration PR.
  - Tailwind: avoid duplicating complex class sets; extract repeated utility groups into a small component or a `combineClasses(...)` helper in `src/utils/classNames.ts`.

- Integration points and external deps to watch for
  - Look in `package.json` for dependencies like `react`, `react-dom`, `tailwindcss`, `vite`, `@vitejs/plugin-react`, `react-router-dom`, `axios`. Changes to these often require updating `vite.config.*` or PostCSS/Tailwind configs.
  - If the project uses environment variables, check `env` files (`.env`, `.env.development`, `.env.production`) and Vite prefix rules (VITE_). Avoid adding secret keys.
  - Backend integration: HTTP calls likely live under `src/api/` or `src/services/`. Use the existing fetch/axios wrapper if present rather than introducing a new global fetch pattern.

- Examples to ground edits (search for these files when making changes)
  - Entry point: `src/main.tsx` or `src/main.jsx`
  - Root component: `src/App.tsx` or `src/App.jsx`
  - Tailwind config: `tailwind.config.cjs` or `tailwind.config.js`
  - Vite config: `vite.config.ts` or `vite.config.js`
  - Package manifest: `package.json`

- When writing code changes, follow these micro-rules
  - Keep changes minimal and localized. Run the dev server to verify visual changes.
  - When adding dependencies, update `package.json` and prefer pinned minor versions if possible.
  - For new components: include a story (if Storybook is used) or a simple test (`src/__tests__/`) using the project's test runner.
  - Use the repo’s import path style: relative imports within `src/` are preferred unless an alias (e.g., `@/`) is configured in `tsconfig.json` / `vite.config`.

- What to do if files are missing or ambiguous
  - If `package.json` is absent, ask the maintainer for the project root. Don’t assume build commands—request clarification.
  - If both `.js` and `.ts` variants exist, prefer TypeScript typings and mirror file extensions for new files.

- Quick PR checklist for AI-generated changes
  - Keep the PR focused to one logical change.
  - Run `npm ci` and `npm run build` (or `npm run dev`) locally and note any errors in the PR description.
  - Include a short manual test in the PR description (what to click/where to look).

If any part of this repository differs from the assumptions above (missing `package.json`, backend code, monorepo layout), tell me where the true repo root is or share the path. I can then merge this draft into an existing `.github/copilot-instructions.md` and refine it with exact file references.
