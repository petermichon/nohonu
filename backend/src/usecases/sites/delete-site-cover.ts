import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { coverImagePath } from '../../shared/paths.ts';
import type { Result } from '../../shared/errors.ts';


export async function deleteSiteCover(sessionId: string, domain: string): Promise<Result<void>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  try {
    await fs.rm(coverImagePath(user, domain), { force: true });
  } catch {
    // File might not exist, that's ok
  }

  data.coverImage = undefined;
  await sitesDb.writeSiteMetadata(user, domain, data);
  return { ok: true, value: undefined };
}


