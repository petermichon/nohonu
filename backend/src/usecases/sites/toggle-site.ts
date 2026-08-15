import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { extractedDir } from '../../shared/paths.ts';
import { site } from '../../db/site.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';

import type { Result } from '../../shared/errors.ts';


export async function toggleSite(sessionId: string, siteId: string): Promise<Result<{ enabled: boolean }>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, siteId);
  if (!data || data.currentIndex === null) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  data.enabled = !data.enabled;
  const siteRowId = await upsertSite(user, siteId, data);
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }

  if (!data.enabled) {
    try {
      await fs.rm(extractedDir(user, siteId), { recursive: true, force: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to delete extracted site for ${user}/${siteId}: ${message}`);
    }
    await site.updateMany({ where: { AND: { userUsername: user, siteId } }, data: { extracted: false } });
  }

  const result = { enabled: data.enabled };
  return { ok: true, value: result };
}


