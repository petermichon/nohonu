import * as fs from 'node:fs/promises';
import { readVersion } from '../../core/sites/read-version.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { versionPath } from '../../shared/paths.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import type { Result } from '../../shared/errors.ts';


export async function downloadVersion(
  sessionId: string,
  domain: string,
  index: number,
): Promise<Result<{ data: Uint8Array; filename: string } | null>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  if (!(await fs.stat(versionPath(user, domain, index)).then(() => true).catch(() => false))) return { ok: true, value: null };
  const data = await readVersion(user, domain, index);
  return { ok: true, value: { data, filename: `${domain}-${index}.zip` } };
}


