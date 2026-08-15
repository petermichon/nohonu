import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { starredBy as starredByTable } from '../../db/starred-by.ts';
import { site as siteTable } from '../../db/site.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import type { Result } from '../../shared/errors.ts';


export async function toggleStar(
  sessionId: string,
  siteOwnerUsername: string,
  siteId: string,
  starred: boolean,
): Promise<Result<{ starred: boolean; starCount: number }>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  // Find the user that owns this site
  const site = await siteTable.findUnique({ where: siteWhere(siteOwnerUsername, siteId), select: { userUsername: true } });
  const siteOwner = site?.userUsername ?? null;
  if (!siteOwner) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const data = await readSiteMetadata(siteOwner, siteId);
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

  const siteRowId = await upsertSite(siteOwner, siteId, data);
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  await starredByTable.deleteMany({ where: { siteId: siteRowId } });
  if (data.starredBy.length > 0) {
    await starredByTable.createMany({
      data: data.starredBy.map((username) => ({ username, siteId: siteRowId })),
    });
  }

  return { ok: true, value: { starred: data.starredBy.includes(user), starCount: data.starredBy.length } };
}


