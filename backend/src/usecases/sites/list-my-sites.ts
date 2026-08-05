import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { getTotalHits } from '../../core/analytics/get-total-hits.ts';
import { getUptimePct } from '../../core/analytics/get-uptime-pct.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { toSiteSummary } from '../../shared/to-site-summary.ts';

import type { Result } from '../../shared/errors.ts';


export async function listMySites(sessionId: string): Promise<Result<Awaited<ReturnType<typeof toSiteSummary>>[]>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const [domains, userRecord] = await Promise.all([
    db.site.findMany({ where: { userUsername: user }, select: { domain: true } }).then((sites) => sites.map((s) => s.domain)),
    db.user.findUnique({ where: { username: user }, select: { profilePicture: true } }),
  ]);
  const accountProfilePicture = userRecord?.profilePicture ?? undefined;
  const value = await Promise.all(
    domains.map(async (domain) => {
      const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
      const data = record ? toSiteData(record) : undefined;
      return toSiteSummary(domain, data, user, accountProfilePicture, getTotalHits(domain), getUptimePct(domain));
    }),
  );
  return { ok: true, value };
}
