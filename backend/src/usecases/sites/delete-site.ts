import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { uptime } from '../../memory/uptime.ts';
import { session } from '../../db/session.ts';
import { site } from '../../db/site.ts';
import { siteDir } from '../../shared/paths.ts';
import { siteKey } from '../../shared/site-key.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function deleteSite(sessionId: string, siteId: string): Promise<Result<void>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  try {
    await fs.rm(siteDir(user, siteId), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete site directory for ${user}/${siteId}: ${message}`);
  }
  await site.deleteMany({ where: { AND: { userUsername: user, siteId } } });
  hits.delete(siteKey(user, siteId));
  visitors.delete(siteKey(user, siteId));
  uptime.delete(siteKey(user, siteId));
  return { ok: true, value: undefined };
}
