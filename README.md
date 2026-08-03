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
- **TypeScript** - Type safety
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
- **Prisma** + libSQL/SQLite - Database
- **Vitest** - Test suite (usecase layer)

### Deployment

- **Docker Compose** - Multi-container orchestration
- **Caddy** - Reverse proxy with automatic HTTPS

## Local Development

**Requirements:** Node.js 20+, Deno 2.x (optional).

```bash
# Terminal 1 — backend
cd backend && npm install && npm run dev

# Terminal 2 — frontend
cd frontend && npm ci && npm run dev
```

Frontend: <http://localhost:5173>
Backend: <http://localhost:8080>

The backend `npm run dev` applies pending Prisma migrations before starting.

## Docker Deployment

```bash
docker compose -f deploy/docker-compose.yml up --build -d
```

See [deploy/README.md](deploy/README.md) for detailed deployment instructions with Caddy reverse proxy setup.
See [frontend/README.md](frontend/README.md) for frontend development details.
