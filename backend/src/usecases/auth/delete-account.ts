import * as fs from 'node:fs/promises';
import { db } from '../../db.ts';
import { SITES_DIR } from '../../config.ts';
import { session as sessionTable } from '../../db/session.ts';
import { user as userTable } from '../../db/user.ts';
import { site as siteTable } from '../../db/site.ts';
import { starredBy as starredByTable } from '../../db/starred-by.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import { verifyPassword } from '../../shared/password.ts';
import { hits } from '../../memory/hits.ts';
import { visitors } from '../../memory/visitors.ts';
import { uptime } from '../../memory/uptime.ts';
import { siteKey } from '../../shared/site-key.ts';

import type { Result } from '../../shared/errors.ts';

export async function deleteAccount(sessionId: string, password: string): Promise<Result<void>> {
  const auth = await requireSession(sessionId);
  if (!auth.ok) return auth;
  const username = auth.value;

  const user = await userTable.findUnique({ where: { username } });
  if (!user) {
    return { ok: false, code: 'not_found', message: 'User not found' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { ok: false, code: 'unauthorized', message: 'Password is incorrect' };
  }

  const ownSites = await siteTable.findMany({
    where: { userUsername: username },
    select: { siteId: true },
  });

  // The user's stars on other people's sites don't cascade on user delete.
  // Remove the rows and decrement each site's denormalized starCount.
  const stars = await starredByTable.findMany({ where: { username } });
  const starCounts = new Map<string, number>();
  for (const star of stars) {
    starCounts.set(star.siteId, (starCounts.get(star.siteId) ?? 0) + 1);
  }

  await db.$transaction([
    ...[...starCounts.entries()].map(([siteId, count]) =>
      siteTable.update({ where: { id: siteId }, data: { starCount: { decrement: count } } }),
    ),
    starredByTable.deleteMany({ where: { username } }),
    userTable.delete({ where: { username } }),
  ]);

  // Remove the user's files (sites, versions, profile picture) — best effort.
  try {
    await fs.rm(`${SITES_DIR}/${username}`, { recursive: true, force: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to delete user directory for ${username}: ${message}`);
  }

  // Drop in-memory analytics for the deleted user's sites.
  for (const { siteId } of ownSites) {
    const key = siteKey(username, siteId);
    hits.delete(key);
    visitors.delete(key);
    uptime.delete(key);
  }

  return { ok: true, value: undefined };
}