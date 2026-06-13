# Nohonu Backend

Deno 2.0 HTTP server for static site hosting. Handles zip uploads, version management, GitHub integration, and real-time
statistics.

## Features

- **Zip uploads** - Deploy static sites via zip file upload
- **GitHub integration** - Deploy directly from GitHub repos
- **Version management** - Keep history of deployments, rollback anytime
- **Real-time stats** - Request counts, unique visitors, uptime monitoring
- **Subdomain serving** - Sites served on `*.your-domain.com`
- **Path-based serving** - Alternative access via `/site-name/` paths

## Architecture

The backend follows a 3-layer architecture:

```txt
┌─────────────────────────────────────────┐
│              API Layer                  │
│    (HTTP handling, thin wrappers)       │
│         src/api/endpoints/              │
├─────────────────────────────────────────┤
│           Use Cases Layer               │
│  (Business logic, one function per      │
│       complete user action)             │
│         src/usecases/sites/             │
├─────────────────────────────────────────┤
│            Core Layer                   │
│   (State management, file I/O, raw      │
│        analytics data storage)          │
│    src/core/sites/ + src/core/analytics/│
└─────────────────────────────────────────┘
```

**Core Layer** (`src/core/`): Handles raw state - file operations, metadata persistence, analytics data structures. No
HTTP knowledge.

**Use Cases Layer** (`src/usecases/`): Contains business logic. Each function represents one complete user action (e.g.,
`deleteSite()`, `deployFromGithub()`). Composes multiple core operations but knows nothing about HTTP.

**API Layer** (`src/api/`): Thin HTTP wrappers. Each endpoint calls exactly one usecase function. Handles request
parsing, auth, and response formatting.

This separation enables:

- **Testability** - Test business logic without HTTP server
- **Clarity** - Each usecase maps directly to a user goal
- **Reusability** - Usecases callable from CLI, scheduled jobs, etc.

## API

### Authentication

When `API_KEY` environment variable is set, all write operations require the header:

```txt
X-Api-Key: your-secret-key
```

Public endpoints (`/health`, `/check-domain`, static file serving) don't require authentication.

### Endpoints

#### Health & Validation

- `GET /health` - Health check, returns `{ "status": "healthy" }`
- `GET /check-domain?domain=...` - Returns 200 if domain exists, 404 if not

#### Sites Management

- `GET /sites` - List all sites with stats (hits, uptime%, accent color)
- `POST /sites/:domain/versions` - Upload zip (multipart: `zip`)
- `POST /sites/:domain/versions/github` - Deploy from GitHub (JSON: `repo`, `branch`)

#### Site Operations (`/sites/:domain`)

- `GET /sites/:domain` - Get site info
- `DELETE /sites/:domain` - Delete site and all its data
- `PATCH /sites/:domain/toggle` - Enable/disable site
- `GET /sites/:domain/download` - Download current version as zip
- `GET /sites/:domain/icon` - Get favicon from zip (ico/png/svg)
- `GET /sites/:domain/meta` - Get metadata (accent color)
- `PATCH /sites/:domain/meta` - Update metadata (accent hex color or null)

#### Stats & Monitoring

- `GET /sites/:domain/stats?slots=60` - Request count per minute slot (default 60)
- `GET /sites/:domain/visitors` - Unique visitor IPs with request counts
- `GET /sites/:domain/uptime?slots=60` - Uptime status per minute slot

#### Version Management (`/sites/:domain/versions`)

- `GET /sites/:domain/versions` - List all archived versions
- `GET /sites/:domain/versions/:timestamp/download` - Download specific version
- `POST /sites/:domain/versions/:timestamp/activate` - Rollback to version
- `DELETE /sites/:domain/versions/:timestamp` - Delete a version

#### Repo History

- `GET /sites/:domain/repos` - List recently used GitHub repos for this domain

## Static File Serving

Sites are served in two ways:

1. **Subdomain**: `http://example.localhost:8080/` serves `sites/example/`
2. **Path**: `http://localhost:8080/example/` serves `sites/example/`

The zip is extracted on first access. Only HTML requests are tracked for stats.

## Environment Variables

| Variable    | Default     | Description                                    |
| ----------- | ----------- | ---------------------------------------------- |
| `PORT`      | `8080`      | Server port                                    |
| `SITES_DIR` | `./data`    | Path for storing site zips and extracted files |
| `API_KEY`   | _(none)_    | Secret key for API authentication              |
| `DOMAIN`    | `localhost` | Domain for HTTPS certificates (Caddy)          |

## Deploying to a VPS

**Requirements on the VPS:** Docker with the Compose plugin, Git.

The stack runs Caddy as a reverse proxy in front of the Deno backend on a shared Docker network. Caddy handles HTTPS
automatically. The backend has no published ports and is unreachable from outside Docker.

```txt
Internet → :80/:443 (Caddy) → backend:8080 (Docker app network)
```

### 1. Create a deploy key

On your local machine:

```bash
ssh-keygen -t ed25519 -C "nohonu-deploy" -f ~/.ssh/nohonu_deploy -N ""
```

Add the **public key** (`~/.ssh/nohonu_deploy.pub`) to the repo:  
GitHub → Settings → Deploy keys → Add deploy key (read-only is enough).

Copy the **private key** to the VPS:

```bash
scp ~/.ssh/nohonu_deploy user@your-vps:~/.ssh/nohonu_deploy
```

Then on the VPS set permissions:

```bash
chmod 600 ~/.ssh/nohonu_deploy
```

On the VPS, add to `~/.ssh/config`:

```txt
Host github.com
  IdentityFile ~/.ssh/nohonu_deploy
  IdentitiesOnly yes
```

### 2. Initial setup

```bash
ssh user@your-vps
```

Test the deploy key works:

```bash
ssh -T git@github.com
# Hi your-user! You've successfully authenticated...
```

Create the directory and clone (do **not** use `sudo` for the clone — it must run as your user so the deploy key is
picked up):

```bash
sudo mkdir -p /opt/nohonu
sudo chown $USER:$USER /opt/nohonu
git clone git@github.com:your-user/nohonu-vibe.git /opt/nohonu
cd /opt/nohonu/deploy
```

Create your `.env` file with a strong random secret and your domain (see `.env.example` for reference):

```bash
echo "API_KEY=$(openssl rand -hex 32)" > .env
echo "DOMAIN=example.com" >> .env
```

Make sure your domain's DNS A record points to the VPS IP. Wildcard subdomains (`*.example.com`) should also point to
the VPS for multi-tenant site serving.

```bash
sudo docker compose up --build -d
```

**Note:** `sudo` does not preserve environment variables by default. If you prefer to pass `DOMAIN` inline instead of
using a `.env` file, use one of these approaches:

```bash
# Option 1: Use sudo -E to preserve environment
DOMAIN=example.com sudo -E docker compose up --build -d

# Option 2: Export first, then run
export DOMAIN=example.com
sudo docker compose up --build -d
```

Open ports 80 and 443:

```bash
sudo ufw allow 80
sudo ufw allow 443
```

Verify:

```bash
curl https://example.com/health
# {"status":"healthy"}
```

### 3. Redeploy after changes

```bash
ssh user@your-vps
cd /opt/nohonu && git pull
cd deploy && sudo docker compose up --build -d
```

Site data in the `sites_data` volume is untouched by redeployments.

## Running

### Docker (production)

```bash
cd deploy && docker compose up --build -d
cd deploy && docker compose down        # stop
cd deploy && docker compose down -v     # stop and delete all site data
```

### Docker (dev — port 8080 published)

```bash
cd deploy && docker compose run --rm -p 127.0.0.1:8080:8080 backend
cd deploy && docker compose run --rm -p 127.0.0.1:8080:8080 --build backend  # with rebuild
```

### Docker (dev — hot reload)

```bash
cd deploy && docker compose run --rm -p 127.0.0.1:8080:8080 -v ../backend:/app backend deno run --watch --allow-net --allow-env --allow-read --allow-write=/data/sites --no-prompt main.ts
```

### Local development

```bash
deno task dev
```

Requires Deno 2.x. The server auto-reloads on file changes.

## Testing

```bash
# Health check
curl http://localhost:8080/health

# Upload a site (requires API_KEY)
curl -X POST http://localhost:8080/sites/my-site/versions \
  -F "zip=@site.zip" \
  -H "X-Api-Key: your-key"

# List sites
curl http://localhost:8080/sites \
  -H "X-Api-Key: your-key"
```

## Domain Validation

Domains must match: `^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$`

Valid: `my-site`, `blog123`, `a-b-c` Invalid: `-start`, `end-`, `UPPER`, `a.b`
