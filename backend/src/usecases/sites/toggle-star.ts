import * as sitesDb from '../../core/sites/db.ts';
import { findUserForDomain } from '../../core/sites/find-user-for-domain.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';


export async function toggleStar(
  sessionId: string,
  domain: string,
  starred: boolean,
): Promise<Result<{ starred: boolean; starCount: number }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  // Find the user that owns this site
  const siteOwner = await findUserForDomain(domain);
  if (!siteOwner) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const data = await sitesDb.readSiteMetadata(siteOwner, domain);
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

  await sitesDb.writeSiteMetadata(siteOwner, domain, data);

  return { ok: true, value: { starred: data.starredBy.includes(user), starCount: data.starCount } };
}


