import * as fs from 'node:fs/promises';
import * as analytics from '../../core/analytics/metrics.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { domainDir } from '../../shared/paths.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';


export async function deleteSite(sessionId: string, domain: string): Promise<Result<void>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  try {
    await fs.rm(domainDir(user, domain), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete site directory for ${user}/${domain}: ${message}`);
  }
  await db.site.deleteMany({ where: { AND: { userUsername: user, domain } } });
  analytics.clearDomain(domain);
  return { ok: true, value: undefined };
}
