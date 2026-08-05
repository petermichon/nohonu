import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { repoHistory as repoHistoryTable } from '../../db/repo-history.ts';
import { session } from '../../db/session.ts';
import { versionsDir, versionPath, MAX_ZIP_BYTES } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { site } from '../../db/site.ts';
import { syncVersions } from '../../core/sites/sync-versions.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function uploadVersionFromGithub(
  sessionId: string,
  domain: string,
  repo: string,
  ref: string,
): Promise<Result<{ index: number; repo: string; branch: string }>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if domain exists
  const existingData = await readSiteMetadata(user, domain);
  if (!existingData) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
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

  const data = existingData;
  const filtered = data.repoHistory.filter((h) => {
    return !(h.repo === repo && h.branch === ref);
  });
  filtered.unshift({ repo, branch: ref, lastUsed: Date.now() });
  data.repoHistory = filtered.slice(0, 10);
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'github', repo, branch: ref }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();

  await fs.mkdir(versionsDir(user, domain), { recursive: true });
  await fs.writeFile(versionPath(user, domain, index), zipData);
  const siteRowId = (await site.upsert(toSiteUpsert(user, domain, data)))?.id;
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

  return { ok: true, value: { index, repo, branch: ref } };
}


