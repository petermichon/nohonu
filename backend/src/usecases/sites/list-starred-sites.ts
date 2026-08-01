import { db } from '../../db.ts';

export async function listStarredSites(username: string): Promise<{ user: string; domain: string; displayName?: string; coverImage?: string; starCount?: number }[]> {
  const starred = await db.starredBy.findMany({
    where: { username },
    include: { site: { select: { userUsername: true, domain: true, displayName: true, coverImage: true, starCount: true } } },
  });
  return starred.map((s) => ({
    user: s.site.userUsername,
    domain: s.site.domain,
    displayName: s.site.displayName ?? undefined,
    coverImage: s.site.coverImage ?? undefined,
    starCount: s.site.starCount,
  }));
}
