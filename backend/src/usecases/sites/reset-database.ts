import { SITES_DIR } from '../../config.ts';
import { resetAnalytics } from '../../core/analytics/reset-analytics.ts';
import { db } from '../../db.ts';

import * as fs from 'node:fs/promises';




export async function resetDatabase(): Promise<void> {
  await db.user.deleteMany();
  await fs.rm(SITES_DIR, { recursive: true, force: true });
  await fs.mkdir(SITES_DIR, { recursive: true });
  resetAnalytics();
}
