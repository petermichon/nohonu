import * as storage from '../../core/sites/storage.ts';
import * as analytics from '../../core/analytics/metrics.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';


export async function deleteSite(sessionId: string, domain: string): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  await storage.deleteSiteFiles(user, domain);
  analytics.clearDomain(domain);
  return { ok: true, value: undefined };
}


