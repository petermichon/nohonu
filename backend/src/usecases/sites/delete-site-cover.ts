import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { db } from '../../db.ts';
import { coverImagePath } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function deleteSiteCover(sessionId: string, domain: string): Promise<Result<void>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const data = record ? toSiteData(record) : undefined;
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  try {
    await fs.rm(coverImagePath(user, domain), { force: true });
  } catch {
    // File might not exist, that's ok
  }

  data.coverImage = undefined;
  const siteRowId = (await db.site.upsert(toSiteUpsert(user, domain, data)))?.id;
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }
  return { ok: true, value: undefined };
}


