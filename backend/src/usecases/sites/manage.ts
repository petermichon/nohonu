import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import type { Result } from '../../shared/errors.ts';
import { findUserForDomain } from './list.ts';

export async function updateSiteMeta(
  sessionId: string,
  domain: string,
  updates: { subdomain?: string | undefined; displayName?: string | undefined },
): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  if (updates.subdomain !== undefined) {
    if (!VALID_DOMAIN.test(updates.subdomain)) {
      return { ok: false, code: 'invalid', message: 'Invalid subdomain' };
    }
    data.subdomain = updates.subdomain;
  }

  if (updates.displayName !== undefined) {
    data.displayName = updates.displayName || undefined;
  }

  await sitesDb.writeSiteMetadata(user, domain, data);
  return { ok: true, value: undefined };
}

export async function toggleSite(sessionId: string, domain: string): Promise<Result<{ enabled: boolean }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  data.enabled = !data.enabled;
  await sitesDb.writeSiteMetadata(user, domain, data);

  if (!data.enabled) await storage.deleteExtractedFiles(user, domain);

  const result = { enabled: data.enabled };
  return { ok: true, value: result };
}

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

export async function deleteSite(sessionId: string, domain: string): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  await storage.deleteSiteFiles(user, domain);
  analytics.clearDomain(domain);
  return { ok: true, value: undefined };
}
