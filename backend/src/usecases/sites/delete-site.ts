import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { uptime } from '../../memory/uptime.ts';
import { session } from '../../db/session.ts';
import { site } from '../../db/site.ts';
import { domainDir } from '../../shared/paths.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function deleteSite(sessionId: string, domain: string): Promise<Result<void>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  try {
    await fs.rm(domainDir(user, domain), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete site directory for ${user}/${domain}: ${message}`);
  }
  await site.deleteMany({ where: { AND: { userUsername: user, domain } } });
  hits.delete(domain);
  visitors.delete(domain);
  uptime.delete(domain);
  return { ok: true, value: undefined };
}
