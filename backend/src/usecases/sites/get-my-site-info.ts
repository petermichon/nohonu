import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';
import { getSiteInfo } from './get-site-info.ts';


export async function getMySiteInfo(
  sessionId: string,
  domain: string,
): Promise<Result<Awaited<ReturnType<typeof getSiteInfo>>>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  return { ok: true, value: await getSiteInfo(user, domain) };
}


