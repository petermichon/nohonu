import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { repoHistory } from '../../db/repo-history.ts';
import { session } from '../../db/session.ts';
import { versionsDir, versionPath, siteDir } from '../../shared/paths.ts';
import { DEFAULT_DATA } from '../../shared/site-data.ts';
import { site } from '../../db/site.ts';
import { syncVersions } from '../../core/sites/sync-versions.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function createSite(
  sessionId: string,
  siteId: string,
  zipData: Uint8Array,
  subdomain?: string,
): Promise<Result<{ index: number; siteId: string }>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if siteId already exists for this user
  const existingData = await readSiteMetadata(user, siteId);
  if (existingData) {
    return { ok: false, code: 'already_exists', message: 'Site already exists for this user' };
  }

  // siteId is the user-chosen name; subdomain defaults to {user}-{siteId}
  const data = { ...DEFAULT_DATA };
  data.siteId = siteId;
  data.account = user;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();
  data.subdomain = subdomain || `${user}-${siteId}`;
  data.displayName = siteId;

  await fs.mkdir(siteDir(user, siteId), { recursive: true });
  await fs.mkdir(versionsDir(user, siteId), { recursive: true });
  await fs.writeFile(versionPath(user, siteId, index), zipData);

  const siteRowId = await upsertSite(user, siteId, data);
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  await syncVersions(siteRowId, data.versions);
  await repoHistory.deleteMany({ where: { siteId: siteRowId } });
  if (data.repoHistory.length > 0) {
    await repoHistory.createMany({
      data: data.repoHistory.map((r) => ({ repo: r.repo, branch: r.branch, lastUsed: r.lastUsed, siteId: siteRowId })),
    });
  }

  return { ok: true, value: { index, siteId } };
}
