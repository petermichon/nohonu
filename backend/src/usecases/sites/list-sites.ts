import { hits } from '../../memory/hits.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { uptime } from '../../memory/uptime.ts';
import { user as userTable } from '../../db/user.ts';
import { totalHits } from '../../shared/hits-total.ts';
import { siteKey } from '../../shared/site-key.ts';
import { toSiteSummary } from '../../shared/to-site-summary.ts';
import { uptimePercentage } from '../../shared/uptime-percentage.ts';
import { site } from '../../db/site.ts';

export async function listSites(user: string): Promise<Awaited<ReturnType<typeof toSiteSummary>>[]> {
  const [domains, userRecord] = await Promise.all([
    site.findMany({ where: { userUsername: user }, select: { siteId: true } }).then((sites) => sites.map((s) => s.siteId)),
    userTable.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  return Promise.all(
    domains.map(async (siteId) => {
      const data = await readSiteMetadata(user, siteId);
      return toSiteSummary(siteId, data, user, accountProfilePicture, totalHits(hits.get(siteKey(user, siteId))), uptimePercentage(uptime.get(siteKey(user, siteId))));
    }),
  );
}
