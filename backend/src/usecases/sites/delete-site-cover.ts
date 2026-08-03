import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import { coverImagePath } from '../../shared/paths.ts';
import type { Result } from '../../shared/errors.ts';


export async function deleteSiteCover(sessionId: string, domain: string): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
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


