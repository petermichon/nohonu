# Deno 2.0 Backend

A Deno 2.0 backend for deploying static sites via zip file uploads.

## Routes

- `GET /health` - Health check endpoint
- `POST /upload` - Upload a zip file for a domain (requires `domain` and `zip` form fields)
- Subdomain-based static file serving - Files are served based on subdomain (e.g., `example.localhost:8080` serves files from `sites/example/`)

## How to access uploaded sites

1. Upload a zip file with a domain name:

```bash
curl -X POST http://localhost:8080/upload \
  -F "domain=example" \
  -F "zip=@your-site.zip"
```

2. Access the site via either method:
   - **Subdomain**: `http://example.localhost:8080`
   - **Direct path**: `http://localhost:8080/example/index.html`

The backend extracts the zip on first access and serves the static files. The domain can be specified via subdomain or as the first path segment.

## Running

### Docker (recommended)

From the repo root:

```bash
docker compose up --build
```

Site data is persisted in a named Docker volume (`sites_data`).

Environment variables:

| Variable   | Default       | Description                        |
|------------|---------------|------------------------------------|
| `PORT`     | `8080`        | Port the server listens on         |
| `SITES_DIR`| `/data/sites` | Path where site zips are stored    |

### Local (Deno)

Make sure you have Deno 2.x and `unzip` installed:

```bash
deno --version
unzip --version
```

Run the server:

```bash
deno task dev
```

The server will start on port 8080 by default (configurable via `PORT` environment variable).

## Testing the health endpoint

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{ "status": "healthy" }
```
