# Nohonu Frontend

React dashboard for deploying and managing static sites. Built with React 19, TanStack Router, TanStack Query,
TypeScript, Vite, and Tailwind CSS.

## Tech Stack

- React 19 + React DOM
- TanStack Router (file-based routing)
- TanStack Query (server state)
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Lucide React icons
- i18next (English / French)

## Pages

- **Home** (`/`) - Public site discovery and live stats
- **Login / Signup** (`/login`, `/signup`) - Authentication
- **Deploy** (`/deploy`) - Deploy a site from a zip or a GitHub repo
- **User profile** (`/u/:username`) - Tabs for overview, sites, stars, domains, and settings
- **Site page** (`/u/:username/sites/:siteId`) - Details, analytics, domains, versions, and settings
- **Docs** (`/docs`) - Getting started, custom domains, API reference, self-hosting
- **About / Legal** (`/about`, `/legal/*`) - Project info and legal pages

## Features

- Deploy sites via zip file upload or from GitHub repositories
- Version history with rollback
- Enable/disable sites
- Real-time request statistics with time-series charts
- Uptime monitoring
- Unique visitor tracking
- Custom domain management with DNS verification
- Account settings (profile picture, display name, password, sessions)
- Accent color, dark/light theme, and font preferences
- English / French localization

## Scripts

```bash
npm install        # Install dependencies
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Generate routes and build for production
npm run lint       # Run ESLint and typecheck
npm run test       # Run the test suite (vitest)
npm run format     # Run Prettier
```

## Development

The frontend expects the backend at `http://localhost:8080/api` by default (`VITE_API_BASE`). Authentication uses a
session id stored in `localStorage` and sent as the `X-Session-Id` header.

## Project Structure

```txt
src/
├── routes/         # TanStack file-based routes (routeTree.gen.ts is generated)
├── pages/          # Page components
├── components/     # Reusable components (topbar, profile, sitepage, …)
├── hooks/          # Custom hooks (api hooks, useConnection, useSiteData, …)
├── providers/      # Context providers (Connection, Theme, Accent, Font, Language, Toast)
└── lib/            # Utilities (types, i18n, fonts, utils)
```