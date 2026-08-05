import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { extractedDir } from '../../shared/paths.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import * as fs from 'node:fs/promises';

import type { Result } from '../../shared/errors.ts';


export async function toggleSite(sessionId: string, domain: string): Promise<Result<{ enabled: boolean }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const data = record ? toSiteData(record) : undefined;
  if (!data || data.currentIndex === null) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  data.enabled = !data.enabled;
  const siteRowId = (await db.site.upsert(toSiteUpsert(user, domain, data)))?.id;
  if (!siteRowId) {
    return { ok: false, code: 'internal', message: 'Failed to save site' };
  }

  if (!data.enabled) {
    try {
      await fs.rm(extractedDir(user, domain), { recursive: true, force: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to delete extracted site for ${user}/${domain}: ${message}`);
    }
    await db.site.updateMany({ where: { AND: { userUsername: user, domain } }, data: { extracted: false } });
  }

  const result = { enabled: data.enabled };
  return { ok: true, value: result };
}


