# Nohonu

A static site hosting platform. Upload zip archives, serve them on subdomains.

<https://github.com/petermichon/nohonu>

## Project Structure

```txt
nohonu/
├── frontend/   # Frontend (React)
├── backend/    # Backend (Node.js + Express)
└── deploy/     # Docker Compose + Caddy
```

## Technology Stack

### Frontend

- **React** 19 - UI framework
- **TypeScript** 6.0 - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** 4 - Utility-first CSS framework
- **TanStack Router** - Client-side routing
- **TanStack Query** - Server state
- **Recharts** - Charts
- **Lucide React** - Icon library
- **Fontsource** - Font packages

### Backend

- **Node.js** - Runtime
- **Express** 5 - HTTP server
- **TypeScript** 6.0 - Type safety
- **Prisma** + libSQL/SQLite - Database
- **Vitest** - Test suite (usecase layer)

### Deployment

- **Docker Compose** - Multi-container orchestration
- **Caddy** - Reverse proxy with automatic HTTPS

## Local Development

**Requirements:** Node.js 20+, Deno 2.x (optional).

```bash
# Install dependencies (root + backend + frontend)
npm run install:all

# Run both backend and frontend together
npm run dev
```

This uses [concurrently](https://github.com/open-cli-tools/concurrently) to run both dev servers in one terminal, with prefixed output and `--kill-others` so they stop together.

You can also run them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

Frontend: <http://localhost:5173>
Backend: <http://localhost:8080>

The backend `npm run dev` applies pending Prisma migrations before starting. Note: `prisma migrate dev` may prompt for a migration name when the schema changes — with `concurrently`, stdin isn't forwarded by default, so restart the backend in its own terminal if that happens.

## Docker Deployment

```bash
docker compose -f deploy/docker-compose.yml up --build -d
```

See [deploy/README.md](deploy/README.md) for detailed deployment instructions with Caddy reverse proxy setup.
See [frontend/README.md](frontend/README.md) for frontend development details.

## License

Nohonu is released under the [AGPL-3.0-or-later](LICENSE) license. See [NOTICE](NOTICE) for copyright and contact details.
