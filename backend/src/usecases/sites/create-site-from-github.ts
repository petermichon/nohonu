import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import * as paths from '../../core/sites/paths.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { domainDir, MAX_ZIP_BYTES } from '../../shared/paths.ts';
import type { Result } from '../../shared/errors.ts';


export async function createSiteFromGithub(
  sessionId: string,
  domain: string,
  repo: string,
  ref: string,
  subdomain?: string,
): Promise<Result<{ index: number; siteId: string; repo: string; branch: string }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if domain already exists
  const existingData = await sitesDb.readSiteMetadata(user, domain);
  if (existingData) {
    return { ok: false, code: 'already_exists', message: 'Domain already exists for this user' };
  }

  const githubUrl = `https://github.com/${repo}/archive/refs/heads/${ref}.zip`;

  let zipData: Uint8Array;
  try {
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 30_000);
    const response = await fetch(githubUrl, { redirect: 'follow', signal: abort.signal });
    clearTimeout(timeout);

    if (response.status === 404) return { ok: false, code: 'not_found', message: 'Repository or branch not found' };
    if (!response.ok) return { ok: false, code: 'upstream_failed', message: `GitHub error: ${response.status}` };

    const rawBuffer = await response.arrayBuffer();
    if (rawBuffer.byteLength > MAX_ZIP_BYTES) {
      return { ok: false, code: 'invalid', message: `GitHub repo zip too large (max ${MAX_ZIP_BYTES} bytes)` };
    }
    zipData = new Uint8Array(rawBuffer);
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, code: 'upstream_failed', message: 'GitHub request timed out' };
    }
    return { ok: false, code: 'upstream_failed', message: err instanceof Error ? err.message : 'Failed to fetch from GitHub' };
  }

  // Use user-domain as siteId for uniqueness across users
  const siteId = `${user}-${domain}`;

  // Create initial site data
  const data = { ...storage.DEFAULT_DATA };
  data.siteId = siteId;
  data.account = user;
  data.repoHistory = [{ repo, branch: ref, lastUsed: Date.now() }];
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'github', repo, branch: ref }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();
  data.subdomain = subdomain || `${user}-${domain}`;
  data.displayName = domain;

  await fs.mkdir(domainDir(user, domain), { recursive: true });
  await fs.mkdir(paths.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(paths.versionPath(user, domain, index), zipData);
  await sitesDb.writeSiteMetadata(user, domain, data);

  return { ok: true, value: { index, siteId, repo, branch: ref } };
}


