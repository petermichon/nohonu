import { db } from '../../db.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { toSiteSummary } from '../../shared/to-site-summary.ts';

export async function listSites(user: string): Promise<Awaited<ReturnType<typeof toSiteSummary>>[]> {
  const [domains, userRecord] = await Promise.all([
    db.site.findMany({ where: { userUsername: user }, select: { domain: true } }).then((sites) => sites.map((s) => s.domain)),
    db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  return Promise.all(
    domains.map(async (domain) => {
      const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
      const data = record ? toSiteData(record) : undefined;
      return toSiteSummary(domain, data, user, accountProfilePicture, analytics.getTotalHits(domain), analytics.getUptimePct(domain));
    }),
  );
}
