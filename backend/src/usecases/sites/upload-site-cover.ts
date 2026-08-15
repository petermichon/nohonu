import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { coverImagePath } from '../../shared/paths.ts';
import { site } from '../../db/site.ts';
import { upsertSite } from '../../core/sites/upsert-site.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function uploadSiteCover(sessionId: string, siteId: string, imageData: Uint8Array): Promise<Result<void>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, siteId);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  try {
    await fs.writeFile(coverImagePath(user, siteId), imageData);
    data.coverImage = 'cover.jpg';
    const siteRowId = await upsertSite(user, siteId, data);
    if (!siteRowId) {
      return { ok: false, code: 'internal', message: 'Failed to save site' };
    }
    return { ok: true, value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, code: 'internal', message: `Failed to save cover image: ${message}` };
  }
}


