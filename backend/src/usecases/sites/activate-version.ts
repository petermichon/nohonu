import { SESSION_MAX_AGE_MS } from '../../config.ts';
import { session } from '../../db/session.ts';
import { site } from '../../db/site.ts';
import { extractedDir, fileExists, versionPath } from '../../shared/paths.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SITE_INCLUDE } from '../../shared/site-include.ts';
import { toSiteUpsert } from '../../shared/site-upsert-data.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import * as fs from 'node:fs/promises';







import type { Result } from '../../shared/errors.ts';


export async function activateVersion(sessionId: string, domain: string, index: number): Promise<Result<void>> {
  const sessionRecord = await session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  const exists = await fileExists(versionPath(user, domain, index));
  if (!exists) {
    return { ok: false, code: 'not_found', message: 'Version not found' };
  }
  const record = await site.findUnique({ where: siteWhere(user, domain), include: SITE_INCLUDE });
  const data = record ? toSiteData(record) : undefined;
  if (!data) {
    return { ok: false, code: 'internal', message: 'Failed to activate version' };
  }
  data.currentIndex = index;
  data.enabled = true;
  data.lastDeployedAt = Date.now();
  await site.upsert(toSiteUpsert(user, domain, data));
  try {
    await fs.rm(extractedDir(user, domain), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete extracted site for ${user}/${domain}: ${message}`);
  }
  await site.updateMany({ where: { AND: { userUsername: user, domain } }, data: { extracted: false } });
  return { ok: true, value: undefined };
}


