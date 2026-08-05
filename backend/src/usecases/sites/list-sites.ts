import { site } from '../../db/site.ts';
import { user as userTable } from '../../db/user.ts';
import { hits, uptime } from '../../memory.ts';
import { totalHits } from '../../shared/hits-total.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { toSiteSummary } from '../../shared/to-site-summary.ts';
import { uptimePercentage } from '../../shared/uptime-percentage.ts';

export async function listSites(user: string): Promise<Awaited<ReturnType<typeof toSiteSummary>>[]> {
  const [domains, userRecord] = await Promise.all([
    site.findMany({ where: { userUsername: user }, select: { domain: true } }).then((sites) => sites.map((s) => s.domain)),
    userTable.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  return Promise.all(
    domains.map(async (domain) => {
      const record = await site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
      const data = record ? toSiteData(record) : undefined;
      return toSiteSummary(domain, data, user, accountProfilePicture, totalHits(hits.get(domain)), uptimePercentage(uptime.get(domain)));
    }),
  );
}
