# Nohonu

A static site hosting platform. Upload zip archives, serve them on subdomains.

## Project Structure

```
nohonu-vibe/
├── frontend/        # React + TypeScript + Vite + Tailwind
└── backend/         # Deno HTTP server + deploy config
```

## Local Development

**Requirements:** Deno 2.x, Node.js, `unzip`.

```bash
# Terminal 1 — backend
cd backend && deno task dev

# Terminal 2 — frontend
cd frontend && npm ci && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:8080

See [backend/README.md](backend/README.md) for API reference, Docker setup, and deployment instructions.  
See [frontend/README.md](frontend/README.md) for frontend development details.
