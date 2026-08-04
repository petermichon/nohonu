import * as fs from 'node:fs/promises';
import { db } from '../../db.ts';
import { SITES_DIR } from '../../config.ts';

export async function resetStorage(): Promise<void> {
  await db.user.deleteMany();
  await fs.rm(SITES_DIR, { recursive: true, force: true });
  await fs.mkdir(SITES_DIR, { recursive: true });
}
