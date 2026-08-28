# Nohonu Deployment

This folder contains the Docker Compose stack for production deployment.

## Files

| File | Purpose |
|---|---|
| `docker-compose.yml` | Orchestrates Caddy (reverse proxy) and the Node.js backend |
| `Dockerfile.caddy` | Builds Caddy with the OVH DNS plugin and the frontend |
| `Caddyfile` | Reverse-proxy and HTTPS configuration |
| `.env.example` | Environment variables template |
| `.dockerignore` | Keeps the Caddy build context lean |

## Quick start

```bash
cp .env.example .env
# Edit .env: set DOMAIN

docker compose up --build -d
```

See [backend/README.md](../backend/README.md) for the environment variables and backend details.
