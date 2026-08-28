# Nohonu Backend

Node.js (Express + Prisma/SQLite) server for static site hosting. Handles zip uploads, GitHub deploys, version
management, custom domains, user accounts, and real-time statistics.

## Features

- **User accounts** - Register/login with sessions, profile pictures, session management
- **Zip uploads** - Deploy static sites via zip file upload
- **GitHub integration** - Deploy directly from GitHub repos
- **Version management** - Keep history of deployments, rollback anytime
- **Custom domains** - Attach verified custom domains to sites
- **Real-time stats** - Request counts, unique visitors, uptime monitoring
- **Subdomain serving** - Sites served on `*.your-domain.com`
- **Path-based serving** - Alternative access via `/site-name/` paths

## Architecture

The backend follows a layered architecture:

```txt
┌────────────────────────────────────────────────┐
│                  API Layer                     │
│     (HTTP handling, thin wrappers)             │
│              src/api/endpoints/                │
├────────────────────────────────────────────────┤
│              Use Cases Layer                   │
│  (The app's surface API - one function per     │
│       complete user action)                    │
│          src/usecases/                         │
├────────────────────────────────────────────────┤
│                  Core Layer                    │
│   (App-specific logic: sites, analytics)       │
│         src/core/                              │
├────────────────────────────────────────────────┤
│              Shared / Config                   │
│  (Stateless utilities + env config)            │
│        src/shared/  src/config.ts              │
└────────────────────────────────────────────────┘
```

- **API Layer** (`src/api/`) - Thin HTTP wrappers. Each endpoint calls exactly one usecase function. Handles request
  parsing, session/API-key checks, and response formatting. Knows how to map usecase error codes to HTTP statuses.
- **Use Cases Layer** (`src/usecases/`) - The surface API of the app. Each function represents one complete user action
  (e.g. `createSite()`, `toggleStar()`). Usecases own all business logic and session validation; they are called by
  endpoints, the scheduler, and tests. Tests treat usecases as black boxes.
- **Core Layer** (`src/core/`) - App-specific logic that usecases compose. `src/core/sites/` is split into `paths.ts`
  (pure path helpers), `db.ts` (database), `fs.ts` (filesystem), and `storage.ts` (operations spanning both).
  `src/core/analytics/` holds the in-memory metrics with database persistence.
- **Shared** (`src/shared/`) - Stateless, environment-free utilities: `zip.ts`, `password.ts`, `errors.ts`
  (`Result<T, E>` + `ErrorCode`), and `express/` helpers.
- **Config** (`src/config.ts`) - The single place that reads environment variables.

This separation enables:

- **Testability** - The usecase layer is fully tested without an HTTP server
- **Clarity** - Each usecase maps directly to a user goal
- **Reusability** - Usecases callable from CLI, scheduled jobs, etc.

## Authentication

Header-based sessions. Obtain a session id via `POST /auth/register` or `POST /auth/login`, then send it on
authenticated requests:

```txt
X-Session-Id: <session-id>
```

Public endpoints (`/health`, `/auth/register`, `/auth/login`, `/check-*`, `/explore/sites`, `/users/*`) and
static file serving stay open without a session header.

## API

### Public

| Method | Path                               | Notes                                                            |
| ------ | ---------------------------------- | ---------------------------------------------------------------- |
| GET    | `/health`                          | Health check, returns `{ "status": "healthy", "uptimeMs": ... }` |
| POST   | `/auth/register`                   | Create account: `{ "username", "password" }`                     |
| POST   | `/auth/login`                      | Log in: `{ "username", "password" }`                             |
| GET    | `/check-domain?siteId=&user=`   | 200 if the siteId is taken for the user, else 404              |
| GET    | `/check-subdomain?subdomain=`    | 200 if the subdomain is taken, else 404                          |
| GET    | `/check-custom-domain?domain=`   | 200 if the custom domain is registered, else 404                 |
| GET    | `/explore/sites`                 | Public site discovery list                                       |
| GET    | `/users/:username`               | Public user profile                                              |
| GET    | `/users/:username/sites`         | A user's public sites                                            |
| GET    | `/users/:username/stars`         | Sites starred by a user                                          |
| GET    | `/users/:username/profile-picture` | Profile picture image                                          |
| GET    | `/users/:username/sites/:siteId` | Public site info                                                 |

### Auth (session)

| Method | Path                           | Notes                  |
| ------ | ------------------------------ | ---------------------- |
| GET    | `/auth/me`                     | Current user           |
| POST   | `/auth/logout`                 | Invalidate the session |
| PATCH  | `/auth/displayname`            | `{ "displayName" }`    |
| PATCH  | `/auth/password`               | `{ "currentPassword", "newPassword" }` (min 8 chars) |
| POST   | `/auth/profile-picture`        | Raw image body         |
| DELETE | `/auth/profile-picture/delete` | Remove profile picture |
| GET    | `/auth/sessions`               | List active sessions   |
| DELETE | `/auth/sessions/delete?id=`    | Revoke another session |

### Sites (management)

| Method | Path                                              | Notes                                                                                                                                          |
| ------ | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/sites`                                          | Current user's sites                                                                                                                           |
| POST   | `/users/:username/sites/:siteId`                                  | Create a site. Raw zip body (`Content-Type: application/zip`, optional `?subdomain=`) or JSON `{ "repo", "branch?", "subdomain?" }` for GitHub |
| GET    | `/users/:username/sites/:siteId`                                  | Site info                                                                                                                                      |
| DELETE | `/users/:username/sites/:siteId`                                  | Delete site and all its data                                                                                                                   |
| PATCH  | `/users/:username/sites/:siteId/toggle`                           | Enable/disable                                                                                                                                 |
| PATCH  | `/users/:username/sites/:siteId/star`                             | `{ "starred": bool }`                                                                                                                          |
| PATCH  | `/users/:username/sites/:siteId/meta`                             | `{ "subdomain"?, "displayName"? }`                                                                                                             |
| GET    | `/users/:username/sites/:siteId/download`                         | Download active version as zip                                                                                                                 |
| GET    | `/users/:username/sites/:siteId/icon`                             | Favicon from the archive                                                                                                                       |
| GET    | `/users/:username/sites/:siteId/cover`                            | Cover image                                                                                                                                    |
| POST   | `/users/:username/sites/:siteId/cover`                            | Raw image body                                                                                                                                 |
| DELETE | `/users/:username/sites/:siteId/cover`                            | Remove cover image                                                                                                                             |
| GET    | `/users/:username/sites/:siteId/meta`                             | Site metadata (subdomain)                                                                                                                      |
| GET    | `/users/:username/sites/:siteId/stats?slots=&group=`              | Request count per minute slot                                                                                                                  |
| GET    | `/users/:username/sites/:siteId/visitors`                         | Unique visitor IPs with counts                                                                                                                 |
| GET    | `/users/:username/sites/:siteId/uptime?slots=&group=`             | Uptime status per minute slot                                                                                                                  |
| GET    | `/users/:username/sites/:siteId/repos`                            | Recently used GitHub repos                                                                                                                     |
| GET    | `/users/:username/sites/:siteId/versions`                         | List versions                                                                                                                                  |
| POST   | `/users/:username/sites/:siteId/versions`                         | Upload a version (raw zip body)                                                                                                                |
| POST   | `/users/:username/sites/:siteId/versions/github`                  | Deploy from GitHub: `{ "repo", "branch?" }`                                                                                                    |
| GET    | `/users/:username/sites/:siteId/versions/:timestamp/download`     | Download a specific version                                                                                                                    |
| POST   | `/users/:username/sites/:siteId/versions/:timestamp/activate`     | Roll back to a version                                                                                                                         |
| DELETE | `/users/:username/sites/:siteId/versions/:timestamp`              | Delete a version                                                                                                                               |
| GET    | `/users/:username/sites/:siteId/custom-domains`                   | List custom domains                                                                                                                            |
| GET    | `/users/:username/sites/:siteId/custom-domains/token`             | DNS verification token                                                                                                                         |
| POST   | `/users/:username/sites/:siteId/custom-domains`                   | Add: `{ "customDomain" }`                                                                                                                      |
| POST   | `/users/:username/sites/:siteId/custom-domains/:subAction/verify` | Verify against DNS                                                                                                                             |
| DELETE | `/users/:username/sites/:siteId/custom-domains/:subAction`        | Remove a custom domain                                                                                                                         |

### Custom domains (global)

| Method | Path              | Notes              |
| ------ | ----------------- | ------------------ |
| GET    | `/custom-domains` | All custom domains |

## Static File Serving

Sites are served in two ways:

1. **Subdomain**: `http://example.localhost:8080/` serves the site whose `subdomain` is `example`
2. **Path**: `http://localhost:8080/example/` serves the site named `example`

The zip is extracted on first access. Only HTML requests are tracked for analytics.

## Database & Migrations

Data is stored in a SQLite database (via Prisma + libSQL), with a schema in `prisma/schema.prisma` and configuration in
`prisma.config.ts`. Schema changes go through **migrations**:

- **Dev**: `prisma migrate dev` (applies + generates a migration on schema change)
- **Prod**: `prisma migrate deploy` (applies committed migrations only — run by the Docker entrypoint)

The test suite also runs `migrate deploy` against a temp database, so tests always mirror production's schema.

## Environment Variables

| Variable         | Default                 | Description                            |
| ---------------- | ----------------------- | -------------------------------------- |
| `PORT`           | `8080`                  | Server port                            |
| `SITES_DIR`      | `./data`                | Path for site zips and extracted files |
| `DATABASE_URL`   | `file:./data/nohonu.db` | SQLite database location               |
| `API_KEY`        | _(none)_                | Secret key for the management API      |
| `SUBDOMAIN_BASE` | `localhost:8080`        | Base host for subdomain URLs           |

## Running Locally

**Requirements:** Node.js 20+.

```bash
npm install
npm run dev
```

`npm run dev` applies pending migrations (`prisma migrate dev`) and starts the server with hot reload on port 8080.

Other commands:

```bash
npm test          # run the usecase test suite (vitest)
npm run coverage  # test coverage report
npm run typecheck # tsc --noEmit
```

## Deploying

See [deploy/README.md](../deploy/README.md) for Docker + Caddy deployment. The Docker entrypoint runs
`prisma migrate deploy` before starting the server.

## Domain Validation

Site domains must match: `^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$`

Valid: `my-site`, `blog123`, `a-b-c` Invalid: `-start`, `end-`, `UPPER`, `a.b`
