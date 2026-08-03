import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import * as paths from '../../core/sites/paths.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';


export async function uploadVersion(sessionId: string, domain: string, zipData: Uint8Array): Promise<Result<{ index: number }>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;

  // Check if domain exists
  const existingData = await sitesDb.readSiteMetadata(user, domain);
  if (!existingData) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  const data = existingData;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();

  await fs.mkdir(paths.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(paths.versionPath(user, domain, index), zipData);
  await sitesDb.writeSiteMetadata(user, domain, data);

  return { ok: true, value: { index } };
}


