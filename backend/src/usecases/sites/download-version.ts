import * as fsOps from '../../core/sites/fs.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import type { Result } from '../../shared/errors.ts';


export async function downloadVersion(
  sessionId: string,
  domain: string,
  index: number,
): Promise<Result<{ data: Uint8Array; filename: string } | null>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  console.assert(typeof domain === 'string' && domain.length > 0, 'domain must be a non-empty string');
  console.assert(typeof index === 'number' && !isNaN(index) && index >= 0, 'index must be a valid number');
  if (!(await fsOps.versionExists(user, domain, index))) return { ok: true, value: null };
  const data = await fsOps.readVersion(user, domain, index);
  return { ok: true, value: { data, filename: `${domain}-${index}.zip` } };
}


