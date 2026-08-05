import { session } from '../../db/session.ts';
import { fileExists, versionPath } from '../../shared/paths.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import * as fs from 'node:fs/promises';




import type { Result } from '../../shared/errors.ts';


export async function downloadVersion(
  sessionId: string,
  domain: string,
  index: number,
): Promise<Result<{ data: Uint8Array; filename: string } | null>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  if (!(await fileExists(versionPath(user, domain, index)))) return { ok: true, value: null };
  const data = await fs.readFile(versionPath(user, domain, index));
  return { ok: true, value: { data, filename: `${domain}-${index}.zip` } };
}


