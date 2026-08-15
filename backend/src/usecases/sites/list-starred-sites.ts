import { starredBy } from '../../db/starred-by.ts';

export async function listStarredSites(username: string): Promise<{ user: string; siteId: string; displayName?: string; coverImage?: string; starCount?: number }[]> {
  const starred = await starredBy.findMany({
    where: { username },
    include: { site: { select: { userUsername: true, siteId: true, displayName: true, coverImage: true, starCount: true } } },
  });
  return starred.map((s) => ({
    user: s.site.userUsername,
    siteId: s.site.siteId,
    displayName: s.site.displayName ?? undefined,
    coverImage: s.site.coverImage ?? undefined,
    starCount: s.site.starCount,
  }));
}

