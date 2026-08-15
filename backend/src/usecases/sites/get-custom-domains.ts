import { readSiteMetadata } from '../../core/sites/read-site-metadata.ts';
import { session } from '../../db/session.ts';
import { requireSession } from '../../core/auth/require-session.ts';

import type { Result } from '../../shared/errors.ts';
import type { CustomDomain } from '../../shared/custom-domain.ts';


export async function getCustomDomains(sessionId: string, siteId: string): Promise<Result<CustomDomain[]>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const user = auth.value;
  const data = await readSiteMetadata(user, siteId);
  if (!data) return { ok: true, value: [] };
  const customDomains = data.customDomains ?? [];
  return { ok: true, value: customDomains.map(({ domain: d, verified }) => ({ domain: d, verified })) };
}
