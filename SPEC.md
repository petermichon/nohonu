# Nohonu — Product Spec (draft)

> A self-hosted, single-tenant tool for deploying containers on your own server.

## What it is

- Self-hosted, single-tenant tool that deploys containers on your own box from one ready-to-run stack.
- Everything is a container; source is an OCI image (GHCR default, registry-agnostic); CI builds, the server pulls by digest.
- A version is a digest; rollback is an earlier digest.
- Sync — reconciling an app to its source — is the one core primitive, driven by scheduled digest polling or a manual CLI trigger.
- Sync is idempotent and atomic: an unchanged digest is a no-op, and activation happens only after a full, healthy pull.
- Headless: imperative CLI/API commands are the primitives and cover every operation; a UI may come later.
- Machine-readable output — stable JSON, documented schema, exit codes, error taxonomy; docs generated from the schema.
- `status` is a first-class query returning an app's URL, source, digest, health, and history.
- Token-based, non-interactive auth.
- Source and identity are pluggable and decoupled behind one `Source` abstraction; public images deploy anonymously, and an optional GitHub App adds private repos, listing, and higher rate limits.
- Manages containers end to end — pull, run, routing, TLS, health, restart, limits, logs, persistence — and owns apps, deployments, versions, and domains.
- Quality over features — minimal surface, rock-solid core, heavy sync/version tests.

## Architecture

```
                  Internet
                     │
               ┌─────────────┐
               │   Traefik   │   data plane (routing + TLS)
               └──────┬──────┘
          ┌───────────┼─────────────┐
          ▼           ▼             ▼
     nohonu.zone   app1.zone     app2.zone
     (daemon)      (workload)    (workload)

     daemon ──Docker socket──▶ create/replace workloads
     daemon ──Traefik config─▶ add/remove routes + certs
```

- **Control plane** — the `nohonu` daemon (container). Owns desired state; drives Docker and Traefik.
- **Data plane** — Traefik (container). Routes requests, terminates TLS.
- **Workloads** — app containers, created on demand.
- Request traffic never passes through the daemon. The daemon is only ever reached as a control-plane API.
- **Routing config** — the daemon owns one routing table and writes a single dynamic config file that Traefik watches.
- **TLS** — per-host certificates by default (HTTP-01, no DNS credentials); wildcard optional.
- **State** — SQLite inside the daemon on a mounted volume; no source credentials are stored in v1.

## Deploy model

- Source is an OCI image; builds happen in CI, never on the server.
- The server pulls by digest; a version *is* a digest, so rollback is trivial.
- `sync` is the single primitive; triggers are periodic registry-digest polling and a manual CLI command.
- Sync is idempotent and atomic — an unchanged digest is a no-op; an app activates only after a full, healthy pull.

## Interfaces

### CLI

```
nohonu up                      # bring up the stack (daemon + proxy)
nohonu deploy <image>          # create-or-update an app
nohonu update <app>            # re-sync to current source
nohonu ls                      # all apps
nohonu status [app]            # full state/health
nohonu logs <app> [-f]
nohonu rollback <app> [--to <digest>]
nohonu start|stop|restart <app>
nohonu rm <app>
nohonu domain add|rm|ls <app>
nohonu env set|rm|ls <app>
nohonu poll set <app> --interval 5m
nohonu connect github          # optional source provider
nohonu token create|rm|ls
nohonu doctor
```

### Output

- Human-readable tables by default; `--json` on every command.
- Non-interactive by default; prompts only on a TTY, with `--yes` and `--dry-run`.
- Exit codes plus a documented error taxonomy.

## Auth

- Token-based and non-interactive; no browser sessions. One admin token at first boot; scoped tokens later.

## Source providers

- Pluggable behind a `Source` abstraction, decoupled from identity.
- Public images deploy anonymously.
- Optional GitHub App adds private repos, repo listing, and higher polling rate limits.

## Runtime management

- Pull, run, hostname routing, TLS, health checks, restart policy, resource limits, logs, persistence.
- Owns apps, deployments, versions, and domains; many apps per instance, isolated by configuration.

## Non-goals (for now)

- Webhooks, server-side builds, manifests, zip/upload, social/discovery, multi-tenant/cloud, a required web UI.

## Deferred (decide during build)

- Daemon language/stack and container-runtime support (Docker/Podman, rootless).
- App contract: how port, protocol, and health check are declared.
- Non-HTTP / multi-port apps.
- Persistent volumes; env/secret storage and updates.
- DNS: manage records vs verify only.
- CLI transport and distribution; stack self-update.
- Version/disk GC and health gating.
- Product name.
