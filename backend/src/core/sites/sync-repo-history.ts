import { db } from '../../db.ts';
import type { RepoEntry } from '../../shared/paths.ts';

export async function syncRepoHistory(siteId: string, repoHistory: RepoEntry[]): Promise<void> {
  await db.repoHistory.deleteMany({ where: { siteId } });
  if (repoHistory.length > 0) {
    await db.repoHistory.createMany({
      data: repoHistory.map((r) => ({
        repo: r.repo,
        branch: r.branch,
        lastUsed: r.lastUsed,
        siteId,
      })),
    });
  }
}
