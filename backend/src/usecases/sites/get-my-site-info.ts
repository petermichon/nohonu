import { requireSession } from '../../core/auth/require-session.ts';
import { readSiteInfo } from '../../core/sites/get-site-info.ts';
import type { Result } from '../../shared/errors.ts';


export async function getMySiteInfo(
  sessionId: string,
  domain: string,
): Promise<Result<Awaited<ReturnType<typeof readSiteInfo>>>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  return { ok: true, value: await readSiteInfo(session.value, domain) };
}
