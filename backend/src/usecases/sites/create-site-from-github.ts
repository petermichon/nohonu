import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { repoHistory as repoHistoryTable } from '../../db/repo-history.ts';
import { session } from '../../db/session.ts';
import { versionsDir, versionPath, domainDir, MAX_ZIP_BYTES } from '../../shared/paths.ts';
import { DEFAULT_DATA } from '../../shared/site-data.ts';
import { site } from '../../db/site.ts';
import { syncVersions } from '../../core/sites/sync-versions.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function createSiteFromGithub(
  sessionId: string,
  domain: string,
  repo: string,
  ref: string,
  subdomain?: string,
): Promise<Result<{ index: number; siteId: string; repo: string; branch: string }>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if domain already exists
  const existingData = await readSiteMetadata(user, domain);
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
  const data = { ...DEFAULT_DATA };
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
  await fs.mkdir(versionsDir(user, domain), { recursive: true });
  await fs.writeFile(versionPath(user, domain, index), zipData);

  const siteRowId = await upsertSite(user, domain, data);
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  await syncVersions(siteRowId, data.versions);
  await repoHistoryTable.deleteMany({ where: { siteId: siteRowId } });
  if (data.repoHistory.length > 0) {
    await repoHistoryTable.createMany({
      data: data.repoHistory.map((r) => ({ repo: r.repo, branch: r.branch, lastUsed: r.lastUsed, siteId: siteRowId })),
    });
  }

  return { ok: true, value: { index, siteId, repo, branch: ref } };
}


