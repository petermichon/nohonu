import { hits } from '../../memory/hits.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { uptime } from '../../memory/uptime.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { session } from '../../db/session.ts';
import { user as userTable } from '../../db/user.ts';
import { totalHits } from '../../shared/hits-total.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteSummary } from '../../shared/to-site-summary.ts';
import { uptimePercentage } from '../../shared/uptime-percentage.ts';
import { site } from '../../db/site.ts';

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
      const data = await readSiteMetadata(user, domain);
      return toSiteSummary(domain, data, user, accountProfilePicture, totalHits(hits.get(domain)), uptimePercentage(uptime.get(domain)));
    }),
  );
  return { ok: true, value };
}
