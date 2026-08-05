import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { db } from '../../db.ts';
import { versionsDir, versionPath, domainDir } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { DEFAULT_DATA } from '../../shared/site-data.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { toVersionSourceData } from '../../shared/version-source-data.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function createSite(
  sessionId: string,
  domain: string,
  zipData: Uint8Array,
  subdomain?: string,
): Promise<Result<{ index: number; siteId: string }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if domain already exists
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const existingData = record ? toSiteData(record) : undefined;
  if (existingData) {
    return { ok: false, code: 'already_exists', message: 'Domain already exists for this user' };
  }

  // Use user-domain as siteId for uniqueness across users
  const siteId = `${user}-${domain}`;

  // Create initial site data
  const data = { ...DEFAULT_DATA };
  data.siteId = siteId;
  data.account = user;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();
  data.subdomain = subdomain || `${user}-${domain}`;
  data.displayName = domain;

  await fs.mkdir(domainDir(user, domain), { recursive: true });
  await fs.mkdir(versionsDir(user, domain), { recursive: true });
  await fs.writeFile(versionPath(user, domain, index), zipData);

  const siteRowId = (await db.site.upsert(toSiteUpsert(user, domain, data)))?.id;
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  for (const [key, entry] of Object.entries(data.versions)) {
    const index = parseInt(key, 10);
    const existingVersion = await db.version.findFirst({ where: { siteId: siteRowId, index } });
    const sourceData = toVersionSourceData(entry.source);
    if (existingVersion) {
      await db.version.update({ where: { id: existingVersion.id }, data: { ...sourceData, createdAt: entry.createdAt } });
    } else {
      await db.version.create({ data: { index, createdAt: entry.createdAt, siteId: siteRowId, ...sourceData } });
    }
  }
  const versionIndices = new Set(Object.keys(data.versions).map(Number));
  await db.version.deleteMany({ where: { siteId: siteRowId, index: { notIn: Array.from(versionIndices) } } });
  await db.repoHistory.deleteMany({ where: { siteId: siteRowId } });
  if (data.repoHistory.length > 0) {
    await db.repoHistory.createMany({
      data: data.repoHistory.map((r) => ({ repo: r.repo, branch: r.branch, lastUsed: r.lastUsed, siteId: siteRowId })),
    });
  }

  return { ok: true, value: { index, siteId } };
}


