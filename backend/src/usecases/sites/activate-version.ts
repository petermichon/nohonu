import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { extractedDir, fileExists, versionPath } from '../../shared/paths.ts';
import { site } from '../../db/site.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';







import type { Result } from '../../shared/errors.ts';


export async function activateVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fileExists(versionPath(user, domain, index));
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const data = await readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'internal', message: 'Failed to activate version' };
  }
  data.currentIndex = index;
  data.enabled = true;
  data.lastDeployedAt = Date.now();
  await upsertSite(user, domain, data);
  try {
    await fs.rm(extractedDir(user, domain), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete extracted site for ${user}/${domain}: ${message}`);
  }
  await site.updateMany({ where: { AND: { userUsername: user, domain } }, data: { extracted: false } });
  return { ok: true, value: undefined };
}


