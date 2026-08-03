import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import { coverImagePath } from '../../shared/paths.ts';
import type { Result } from '../../shared/errors.ts';

export async function getSiteCover(user: string, domain: string): Promise<Uint8Array | null> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || !data.coverImage) return null;

  try {
    return await fs.readFile(coverImagePath(user, domain));
  } catch {
    return null;
  }
}

export async function uploadSiteCover(sessionId: string, domain: string, imageData: Uint8Array): Promise<Result<void>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: false, code: 'not_found', message: 'Site not found' };
  }

  try {
    await fs.writeFile(coverImagePath(user, domain), imageData);
    data.coverImage = 'cover.jpg';
    await sitesDb.writeSiteMetadata(user, domain, data);
    return { ok: true, value: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, code: 'internal', message: `Failed to save cover image: ${message}` };
  }
}

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
