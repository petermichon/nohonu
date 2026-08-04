import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { listSites } from '../../core/sites/list-sites.ts';
import type { Result } from '../../shared/errors.ts';


export async function listMySites(sessionId: string): Promise<Result<Awaited<ReturnType<typeof listSites>>>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  return { ok: true, value: await listSites(auth.value) };
}
