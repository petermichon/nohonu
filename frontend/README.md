# Nohonu Frontend

React dashboard for managing static sites. Built with React 19, TypeScript, Vite, Tailwind CSS, and Lucide icons.

## Pages

- **Sites** (`/`) - List, search, and manage deployed sites. Deploy new sites via zip upload or GitHub.
- **Site Details** (`/sites/:domain`) - View detailed stats, versions, visitors, and uptime for a specific site.
- **Domains** (`/domains`) - Placeholder for custom domain configuration (future feature).
- **Servers** (`/servers`) - Placeholder for server configuration (future feature).

## Features

- Deploy sites via zip file upload
- Deploy directly from GitHub repositories
- View real-time request statistics with time-series charts
- Monitor site uptime
- Track unique visitor IPs
- Version history with rollback capability
- Enable/disable sites
- Search and filter sites
- Compact/normal view modes
- Dark/light theme toggle
- Connection settings popover (configure API URL and key)

## Tech Stack

- React 19 + React DOM
- React Router 7
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- Lucide React icons

## Scripts

```bash
npm install    # Install dependencies
npm run dev    # Start dev server (http://localhost:5173)
npm run build  # Build for production
npm run lint   # Run ESLint
npm run format # Run Prettier
```

## Development

The frontend expects the backend at `http://localhost:8080` by default. Change this in the Settings popover (gear icon in the header) if needed.

When API_KEY is set on the backend, add it in Settings for authenticated requests.

## Project Structure

```
src/
├── pages/           # Route components
│   ├── Sites.tsx    # Main site list
│   ├── SitePage.tsx # Site details, stats, versions
│   ├── Domains.tsx  # Domain config (placeholder)
│   └── Servers.tsx  # Server config (placeholder)
├── components/      # Reusable components
│   ├── SiteCard.tsx # Site card with stats/actions
│   └── InlineDeployForm.tsx # Upload/GitHub deploy form
└── lib/             # Utilities and providers
    ├── api.ts       # API fetch wrapper
    ├── types.ts     # TypeScript types
    ├── ThemeProvider.tsx  # Dark/light theme
    └── ConnectionProvider.tsx  # API connection config
```

## API Connection

The frontend uses a connection provider that stores API URL and key in memory (no localStorage). Configure via the Settings gear icon in the header.

Default: `http://localhost:8080` with no API key.
