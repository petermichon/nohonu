# Improvements backlog

Parked, direction-independent improvements to the current app. Ordered by
priority; fix the security items before anything else. This list is intentionally
flat — no categories.

Product-direction decisions (why rework, product center of gravity, content
isolation / auth model) are not tracked here; they're discussion items that
reshape this list.

## Checklist

- [ ] **Fix path traversal in static serving (critical).** `isSafeRelativePath` is only applied on extraction (`backend/src/core/sites/serve-site-file.ts:40`), not on read (`:64-67`). Express 5 preserves `..` in `req.path`, so on a live subdomain the SQLite DB (password hashes, session ids) may be readable.
- [ ] **Remove the duplicate site-info route.** `GET /users/:username/sites/:siteId` is registered twice (`backend/src/api/router.ts:69` public, `:85` owner); the owner handler is shadowed and never runs.
- [ ] **Add auth to stats / visitors / uptime / global custom-domains.** No session checks (`get-site-stats.ts`, `get-site-visitors.ts`, `get-all-custom-domains.ts`, `get-verification-token.ts`); `/explore/sites` trusts client `X-Username` for `isStarred`.
- [ ] **Cap uncompressed zip size + entry count.** The 50 MB cap is compressed-only; `readZip` has no uncompressed/entry limit and decompresses fully in memory (`backend/src/shared/zip.ts`). Stop re-decompressing per icon request.
- [ ] **Harden auth.** No rate limiting; register accepts 1-char passwords (`extract-register-params.ts:7`) vs change-password's 8; PBKDF2 100k compared in a non-constant-time loop (`password.ts:11,47`).
- [ ] **Make custom domains globally unique.** Uniqueness is `(siteId, domain)`, so two sites can claim one domain and `findFirst` picks arbitrarily (`resolve-domain-and-serve.ts:20`); `add-custom-domain` never calls `checkCustomDomain`.
- [ ] **Fix read-modify-write races; collapse the `SiteData` ↔ relational round-trip to one source of truth.** ~15 site usecases read a snapshot, mutate, then upsert scalars + `deleteMany`/`createMany` child rows; a star can revert a concurrent toggle/activate.
- [ ] **Atomic stars.** Drop `deleteMany`+`createMany` per toggle; derive or atomically maintain `starCount`.
- [ ] **Rebuild analytics as events + rollups,** not the in-RAM JSON blob (`Analytics.data`, `save-analytics.ts` / `load-analytics.ts`).
- [ ] **Cache `host → site` resolution; unique index on `subdomain`; fix path `siteId` ambiguity.** Currently O(users × sites) per request (`resolve-domain-and-serve.ts:32-42`).
- [ ] **Shared `types` package + one validation lib.** Kill the `extract-*` sprawl and `console.assert`-as-validation.
- [ ] **Deploy tokens as a first-class auth type.**
- [ ] **Drop-in deploy: GitHub Action and/or CLI.**
- [ ] **Fix frontend cache keys (add `username`); clear cache on logout.** (`useSiteData.ts:33,47,60`, `useLogout.ts:13`).
- [ ] **Gate `/deploy`; fix "any error → Site not found"; refresh site on subdomain edit.** (`InlineDeployForm.tsx:81,98`, `useSiteData.ts:105`, `useUpdateSiteConfig.ts:18`).
- [ ] **Kill Home card N+1; stop double-fetching sites on `UserPage`.** (`HomeSiteCard.tsx:17`, `UserPage.tsx:32-33`).
- [ ] **Decide API versioning / OpenAPI vs hand-maintained docs.**
- [ ] **Remove dead endpoints, usecases, helpers, config** (uptime, visitors, token route, `logout-all`, `useServers`, 9 `Logo*` components, etc.).
- [ ] **Commit to i18n or delete the stub.** Catalog is one key (`frontend/src/lib/i18n.ts:7,12`); README overclaims EN/FR.
- [ ] **Prune fonts (22 unused faces) and wire or drop `tailwind.config.js`.** Only 4 fonts are selectable.
- [ ] **Extract the triplicated particle canvas** (`Home.tsx`, `Login.tsx`, `Signup.tsx`).
- [ ] **Remove Deno remnants** (`backend/deno.json`, `deno.lock`) **and clean up "fix/align" migrations.**
- [ ] **Structured logging / real health checks.**
- [ ] **Fill backend tests + add a real route-layer test.** 36 frontend test files vs 6 backend; route layer untested.
- [ ] **Quotas + abuse posture for hosted content.**
