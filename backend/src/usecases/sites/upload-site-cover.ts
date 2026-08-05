import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { coverImagePath } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { site } from '../../db/site.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function uploadSiteCover(sessionId: string, domain: string, imageData: Uint8Array): Promise<Result<void>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  try {
    await fs.writeFile(coverImagePath(user, domain), imageData);
    data.coverImage = 'cover.jpg';
    const siteRowId = (await site.upsert(toSiteUpsert(user, domain, data)))?.id;
    if (!siteRowId) {
      return { ok: false, code: 'internal', message: 'Failed to save site' };
    }
    return { ok: true, value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, code: 'internal', message: `Failed to save cover image: ${message}` };
  }
}


