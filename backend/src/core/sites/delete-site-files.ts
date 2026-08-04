import * as fs from 'node:fs/promises';
import { db } from '../../db.ts';
import { domainDir } from '../../shared/paths.ts';

export async function deleteSiteFiles(user: string, domain: string): Promise<void> {
  try {
    await fs.rm(domainDir(user, domain), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete site directory for ${user}/${domain}: ${message}`);
  }
  await db.site.deleteMany({ where: { AND: { userUsername: user, domain } } });
}
