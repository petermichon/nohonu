import { requireSession } from '../../core/auth/require-session.ts';
import { listSites } from '../../core/sites/list-sites.ts';
import type { Result } from '../../shared/errors.ts';


export async function listMySites(sessionId: string): Promise<Result<Awaited<ReturnType<typeof listSites>>>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  return { ok: true, value: await listSites(session.value) };
}
