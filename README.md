# Nohonu

A static site hosting platform. Upload zip archives, serve them on subdomains.

## Project Structure

```
nohonu-vibe/
├── frontend/        # React + TypeScript + Vite + Tailwind
├── backend/         # Deno HTTP server
└── docker-compose.yml
```

## Running with Docker

**Requirements:** Docker with the Compose plugin.

### Production

```bash
docker compose up --build -d
```

Runs in the background. Site data persists in the `sites_data` named volume.

```bash
docker compose down        # stop
docker compose down -v     # stop and delete all site data
```

### Development (hot reload)

```bash
docker compose --profile dev up backend-dev
```

Mounts `./backend` into the container — any save to `main.ts` restarts the server automatically via `deno --watch`.

### Environment variables

| Variable    | Default       | Description                     |
|-------------|---------------|---------------------------------|
| `PORT`      | `8080`        | Port the server listens on      |
| `SITES_DIR` | `/data/sites` | Path where site zips are stored |

## Deploying to a VPS

**Requirements on the VPS:** Docker with the Compose plugin, Git.

The stack runs Caddy as a reverse proxy in front of the Deno backend. Caddy handles HTTPS automatically. The backend is not exposed to the internet directly.

```
Internet → :443 (Caddy) → backend:8080 (internal Docker network)
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

```
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

Create the directory and clone (do **not** use `sudo` for the clone — it must run as your user so the deploy key is picked up):

```bash
sudo mkdir -p /opt/nohonu
sudo chown $USER:$USER /opt/nohonu
git clone git@github.com:your-user/nohonu-vibe.git /opt/nohonu
cd /opt/nohonu
```

Create your `.env` file with a strong random secret:

```bash
echo "API_KEY=$(openssl rand -hex 32)" > .env
```

Edit `Caddyfile` to set your domain (already set to `petermichon.fr`). Make sure your domain's DNS A record points to the VPS IP.

Start everything:

```bash
sudo docker compose up --build -d
```

Open ports 80 and 443, block direct backend access:

```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 8080
```

Verify:

```bash
curl https://petermichon.fr/health
# {"status":"healthy"}
```

### 3. Redeploy after changes

```bash
ssh user@your-vps
cd /opt/nohonu
git pull
sudo docker compose up --build -d
```

Site data in the `sites_data` volume is untouched by redeployments.

## Local Development

**Requirements:** Deno 2.x, Node.js, `unzip`.

```bash
# Terminal 1 — backend
cd backend && deno task dev

# Terminal 2 — frontend
cd frontend && npm install && npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:8080

## API Endpoints

- `GET  /health` — health check
- `GET  /sites` — list all sites
- `POST /upload` — upload a new site (multipart: `domain`, `zip`)
- `GET  /sites/:domain` — get site info
- `GET  /sites/:domain/icon` — get site favicon (see below)
- `GET  /sites/:domain/download` — download site zip
- `GET  /sites/:domain/stats` — request stats (15-minute sliding window)
- `GET  /sites/:domain/versions` — list archived versions
- `PATCH  /sites/:domain/toggle` — enable / disable site
- `DELETE /sites/:domain` — delete site
- `DELETE /sites/:domain/versions/:timestamp` — roll back to a version

## Site Icon Lookup

`GET /sites/:domain/icon` looks inside the site's zip for a favicon in this exact order:

1. `favicon.ico`
2. `favicon.png`
3. `favicon.svg`

The first file found at the **root of the zip** is returned with the matching content-type. If none are present the endpoint returns `404` and the dashboard falls back to displaying the first letter of the domain name.
