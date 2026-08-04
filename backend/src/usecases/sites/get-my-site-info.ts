import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteInfo } from '../../shared/site-info.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';

const SELECT = {
  enabled: true,
  subdomain: true,
  siteId: true,
  displayName: true,
  account: true,
  coverImage: true,
  currentIndex: true,
} as const;


export async function getMySiteInfo(
  sessionId: string,
  domain: string,
): Promise<Result<Awaited<ReturnType<typeof toSiteInfo>>>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const site = await db.site.findUnique({
    where: { userUsername_domain: { userUsername: auth.value, domain } },
    select: SELECT,
  });
  return { ok: true, value: toSiteInfo(site) };
}
