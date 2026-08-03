import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';
import type { SiteSummary } from './types.ts';
import { listSites } from './list-sites.ts';


export async function listMySites(sessionId: string): Promise<Result<SiteSummary[]>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  return { ok: true, value: await listSites(user) };
}


