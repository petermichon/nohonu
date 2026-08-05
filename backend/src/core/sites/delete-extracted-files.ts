import { db } from '../../db.ts';
import { extractedDir } from '../../shared/paths.ts';
import { siteWhere } from '../../shared/site-where.ts';
import { toSiteData } from '../../shared/to-site-data.ts';
import { upsertSite } from './upsert-site.ts';

import * as fs from 'node:fs/promises';




export async function deleteExtractedFiles(user: string, domain: string): Promise<void> {
  try {
    await fs.rm(extractedDir(user, domain), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete extracted site for ${user}/${domain}: ${message}`);
  }

  const record = await db.site.findUnique({ where: siteWhere(user, domain), include: { versions: true, repoHistories: true, customDomains: true, starredBy: true } });
  const data = record ? toSiteData(record) : undefined;
  if (data) {
    data.extracted = false;
    await upsertSite(user, domain, data);
  }
}
