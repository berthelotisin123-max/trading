# BETZO frontend (React + TypeScript + Vite)

React 19 + TypeScript port of the BETZO prototype. It is a browser-only preview: sign-in is a local PBKDF2 verifier stored in this browser, charts use deterministic illustrative bars, and no data leaves the device.

## Commands

```powershell
npm install
npm run dev      # start the dev server
npm run build    # type-check (tsc -b) and build to dist/
npm run preview  # serve the production build
```

## Structure

- `src/styles/` — BETZO design tokens and global styles (dark default, light via `data-theme` on `<html>`)
- `src/lib/` — storage helpers, preview auth (PBKDF2), instruments catalogue, demo-bars chart math, IndexedDB screenshot stores
- `src/context/` — auth, theme, and toast providers
- `src/components/` — `AppShell` (sidebar/top bar/mobile nav), `Chart` (illustrative SVG chart), `ScreenshotPicker`
- `src/pages/` — public (Welcome, Login, Signup, ForgotPassword) and workspace pages

Routing uses `HashRouter` so the static build can be served from any path without rewrites. Sign-in state ends with the tab session; the preview account persists in `localStorage`.
