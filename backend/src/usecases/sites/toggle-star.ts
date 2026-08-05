import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { writeSiteMetadata } from '../../core/sites/write-site-metadata.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import type { Result } from '../../shared/errors.ts';


export async function toggleStar(
  sessionId: string,
  domain: string,
  starred: boolean,
): Promise<Result<{ starred: boolean; starCount: number }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  // Find the user that owns this site
  const site = await db.site.findFirst({ where: { domain }, select: { userUsername: true } });
  const siteOwner = site?.userUsername ?? null;
  if (!siteOwner) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const record = await db.site.findUnique({ where: siteWhere(siteOwner, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  // Initialize arrays if not present
  if (!data.starredBy) {
    data.starredBy = [];
  }
  if (!data.starCount) {
    data.starCount = 0;
  }

  const isStarred = data.starredBy.includes(user);

  if (starred && !isStarred) {
    // Add star
    data.starredBy.push(user);
    data.starCount = data.starredBy.length;
  } else if (!starred && isStarred) {
    // Remove star
    data.starredBy = data.starredBy.filter((u) => u !== user);
    data.starCount = data.starredBy.length;
  }

  await writeSiteMetadata(siteOwner, domain, data);

  return { ok: true, value: { starred: data.starredBy.includes(user), starCount: data.starCount } };
}


