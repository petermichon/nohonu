import { db } from '../../db.ts';
import { versionPath } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';

import * as fs from 'node:fs/promises';


export async function readActiveVersion(user: string, domain: string): Promise<Uint8Array | undefined> {
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
  if (!data || data.currentIndex === null) return undefined;
  try {
    return await fs.readFile(versionPath(user, domain, data.currentIndex));
  } catch {
    return undefined;
  }
}
