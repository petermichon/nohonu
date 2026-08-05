import { hits } from '../../memory/hits.ts';
import { uptime } from '../../memory/uptime.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { session } from '../../db/session.ts';
import { site } from '../../db/site.ts';
import { user as userTable } from '../../db/user.ts';
import { totalHits } from '../../shared/hits-total.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { toSiteSummary } from '../../shared/to-site-summary.ts';
import { uptimePercentage } from '../../shared/uptime-percentage.ts';

import type { Result } from '../../shared/errors.ts';


export async function listMySites(sessionId: string): Promise<Result<Awaited<ReturnType<typeof toSiteSummary>>[]>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const [domains, userRecord] = await Promise.all([
    site.findMany({ where: { userUsername: user }, select: { domain: true } }).then((sites) => sites.map((s) => s.domain)),
    userTable.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  const value = await Promise.all(
    domains.map(async (domain) => {
      const record = await site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
      const data = record ? toSiteData(record) : undefined;
      return toSiteSummary(domain, data, user, accountProfilePicture, totalHits(hits.get(domain)), uptimePercentage(uptime.get(domain)));
    }),
  );
  return { ok: true, value };
}
