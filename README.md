# Nohonu

A static site hosting platform. Upload zip archives, serve them on subdomains.

## Project Structure

```txt
nohonu-vibe/
├── frontend/        # Frontend
└── backend/         # Backend
```

## Technology Stack

### Frontend

- **React** 19.2.6 - UI framework
- **TypeScript** 6.0.2 - Type safety
- **Vite** 8.0.12 - Build tool and dev server
- **Tailwind CSS** 4.3.0 - Utility-first CSS framework
- **React Router DOM** 7.15.1 - Client-side routing
- **Lucide React** 1.16.0 - Icon library
- **Fontsource** - Font packages (Cinzel, Exo, Inter, JetBrains Mono, Lato, Mona Sans, Montserrat, Noto Sans, Open Sans, Oswald, PT Sans, Raleway, Roboto, Rubik)

### Backend

- **Deno** 2.x - JavaScript/TypeScript runtime and HTTP server

### Deployment

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Caddy** - Reverse proxy with automatic HTTPS

## Local Development

**Requirements:** Deno 2.x, Node.js.

```bash
# Terminal 1 — backend
cd backend && deno task dev

# Terminal 2 — frontend
cd frontend && npm ci && npm run dev
```

Frontend: <http://localhost:5173>
Backend: <http://localhost:8080>

## Docker Deployment

```bash
docker compose -f deploy/docker-compose.yml up --build -d
```

See [deploy/README.md](deploy/README.md) for detailed deployment instructions with Caddy reverse proxy setup.
See [frontend/README.md](frontend/README.md) for frontend development details.
