import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { session } from '../../db/session.ts';
import { site as siteTable } from '../../db/site.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SITE_INFO_SELECT, toSiteInfo } from '../../shared/site-info.ts';

import type { Result } from '../../shared/errors.ts';


export async function getMySiteInfo(
  sessionId: string,
  domain: string,
): Promise<Result<Awaited<ReturnType<typeof toSiteInfo>>>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const site = await siteTable.findUnique({
    where: { userUsername_domain: { userUsername: auth.value, domain } },
    select: SITE_INFO_SELECT,
  });
  return { ok: true, value: toSiteInfo(site) };
}
