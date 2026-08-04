import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { readSiteInfo } from '../../core/sites/get-site-info.ts';
import type { Result } from '../../shared/errors.ts';


export async function getMySiteInfo(
  sessionId: string,
  domain: string,
): Promise<Result<Awaited<ReturnType<typeof readSiteInfo>>>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  return { ok: true, value: await readSiteInfo(auth.value, domain) };
}
