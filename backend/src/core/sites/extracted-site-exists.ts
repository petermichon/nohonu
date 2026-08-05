import { db } from '../../db.ts';
import { extractedDir, extractedFilePath } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { writeSiteMetadata } from './write-site-metadata.ts';

import * as fs from 'node:fs/promises';





export async function extractedSiteExists(user: string, domain: string): Promise<boolean> {
  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
  if (!data?.extracted) return false;
  const dir = extractedDir(user, domain);
  try {
    await fs.stat(dir);
    const indexPath = extractedFilePath(user, domain, 'index.html');
    try {
      await fs.stat(indexPath);
      return true;
    } catch {
      data.extracted = false;
      await writeSiteMetadata(user, domain, data);
      return false;
    }
  } catch {
    data.extracted = false;
    await writeSiteMetadata(user, domain, data);
    return false;
  }
}
