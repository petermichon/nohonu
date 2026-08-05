import * as fs from 'node:fs/promises';
import * as analytics from '../../core/analytics/metrics.ts';
import { db } from '../../db.ts';
import { SITES_DIR } from '../../config.ts';


export async function resetDatabase(): Promise<void> {
  await db.user.deleteMany();
  await fs.rm(SITES_DIR, { recursive: true, force: true });
  await fs.mkdir(SITES_DIR, { recursive: true });
  analytics.resetAnalytics();
}
