import { db } from '../../db.ts';

export async function syncStarredBy(siteId: string, starredBy: string[]): Promise<void> {
  await db.starredBy.deleteMany({ where: { siteId } });
  if (starredBy.length > 0) {
    await db.starredBy.createMany({
      data: starredBy.map((username) => ({
        username,
        siteId,
      })),
    });
  }
}
