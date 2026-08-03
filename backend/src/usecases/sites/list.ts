import { db } from '../../db.ts';
import * as sitesDb from '../../core/sites/db.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import { VALID_DOMAIN } from '../../shared/paths.ts';
import type { Result } from '../../shared/errors.ts';
import type { PublicSiteSummary, SiteSummary } from './types.ts';

// Helper: Find user that owns a domain
export async function findUserForDomain(domain: string): Promise<string | null> {
  const users = await sitesDb.listUsers();
  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    if (domains.includes(domain)) {
      return user;
    }
  }
  return null;
}

export async function listMySites(sessionId: string): Promise<Result<SiteSummary[]>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  return { ok: true, value: await listSites(user) };
}

export async function listSites(user: string): Promise<SiteSummary[]> {
  const [domains, userRecord] = await Promise.all([
    sitesDb.listDomains(user),
    db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  return Promise.all(
    domains.map(async (domain) => {
      const data = await sitesDb.readSiteMetadata(user, domain);
      return {
        siteId: data?.siteId || domain,
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        account: data?.account,
        accountProfilePicture,
        displayName: data?.displayName,
        subdomain: data?.subdomain,
        coverImage: data?.coverImage,
        lastDeployedAt: data?.lastDeployedAt,
        starCount: data?.starCount,
        isStarred: data?.starredBy?.includes(user),
      };
    }),
  );
}

export async function listAllSites(username?: string): Promise<PublicSiteSummary[]> {
  const users = await sitesDb.listUsers();
  const allSites: PublicSiteSummary[] = [];

  for (const user of users) {
    const [domains, userRecord] = await Promise.all([
      sitesDb.listDomains(user),
      db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
    ]);
    const accountProfilePicture = userRecord?.profilePicture ?? undefined;
    for (const domain of domains) {
      const data = await sitesDb.readSiteMetadata(user, domain);
      allSites.push({
        user,
        siteId: data?.siteId || domain,
        domain,
        enabled: data?.enabled ?? false,
        hits: analytics.getTotalHits(domain),
        uptime: analytics.getUptimePct(domain),
        account: data?.account,
        accountProfilePicture,
        displayName: data?.displayName,
        subdomain: data?.subdomain,
        coverImage: data?.coverImage,
        lastDeployedAt: data?.lastDeployedAt,
        starCount: data?.starCount,
        isStarred: username ? data?.starredBy?.includes(username) : undefined,
      });
    }
  }

  return allSites;
}

export async function checkSite(user: string, domain: string): Promise<{ exists: boolean; enabled: boolean }> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  return {
    exists: !!data && data.currentIndex !== null,
    enabled: data?.enabled ?? false,
  };
}

export async function checkSubdomain(subdomain: string): Promise<boolean> {
  if (!subdomain || !VALID_DOMAIN.test(subdomain)) return false;
  const users = await sitesDb.listUsers();
  for (const user of users) {
    const domains = await sitesDb.listDomains(user);
    for (const domain of domains) {
      const data = await sitesDb.readSiteMetadata(user, domain);
      if (data?.subdomain === subdomain) return true;
    }
  }
  return false;
}

export async function checkDomain(user: string, rawDomain: string): Promise<boolean> {
  const domain = rawDomain.replace(/\.petermichon\.fr$/, '');
  if (!VALID_DOMAIN.test(domain)) return false;
  const data = await sitesDb.readSiteMetadata(user, domain);
  return !!data && data.currentIndex !== null;
}
