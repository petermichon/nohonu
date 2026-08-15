import { session } from '../../db/session.ts';
import { site as siteTable } from '../../db/site.ts';
import { SITE_INFO_SELECT, toSiteInfo } from '../../shared/site-info.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import type { Result } from '../../shared/errors.ts';


export async function getMySiteInfo(
  sessionId: string,
  siteId: string,
): Promise<Result<Awaited<ReturnType<typeof toSiteInfo>>>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const site = await siteTable.findUnique({
    where: { userUsername_siteId: { userUsername: auth.value, siteId } },
    select: SITE_INFO_SELECT,
  });
  return { ok: true, value: toSiteInfo(site) };
}
