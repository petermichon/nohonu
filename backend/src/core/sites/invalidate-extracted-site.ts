import * as fs from 'node:fs/promises';
import { site } from '../../db/site.ts';
import { extractedDir } from '../../shared/paths.ts';

export async function invalidateExtractedSite(user: string, siteId: string): Promise<void> {
  try {
    await fs.rm(extractedDir(user, siteId), { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete extracted site for ${user}/${siteId}: ${message}`);
  }
  await site.updateMany({ where: { AND: { userUsername: user, siteId } }, data: { extracted: false } });
}