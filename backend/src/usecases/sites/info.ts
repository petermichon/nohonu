import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import { requireSession } from '../../core/auth/require-session.ts';
import { readZip } from '../../shared/zip.ts';
import type { Result } from '../../shared/errors.ts';
import type { RepoHistoryEntry } from './types.ts';

export async function getMySiteInfo(
  sessionId: string,
  domain: string,
): Promise<Result<Awaited<ReturnType<typeof getSiteInfo>>>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  return { ok: true, value: await getSiteInfo(user, domain) };
}

export async function getSiteInfo(
  user: string,
  domain: string,
): Promise<{
  enabled: boolean;
  subdomain?: string;
  siteId: string;
  displayName?: string;
  account?: string;
  coverImage?: string;
} | null> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || data.currentIndex === null) return null;
  return {
    enabled: data.enabled,
    subdomain: data.subdomain,
    siteId: data.siteId,
    displayName: data.displayName,
    account: data.account,
    coverImage: data.coverImage,
  };
}

export async function downloadActiveVersion(
  user: string,
  domain: string,
): Promise<{ data: Uint8Array; filename: string } | null> {
  const meta = await sitesDb.readSiteMetadata(user, domain);
  if (!meta || !meta.enabled || meta.currentIndex === null) return null;
  const data = await storage.readActiveVersion(user, domain);
  if (!data) return null;
  return { data, filename: `${domain}.zip` };
}

export async function getSiteIcon(
  user: string,
  domain: string,
): Promise<{ data: Uint8Array; contentType: string } | null> {
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data || !data.enabled || data.currentIndex === null) return null;

  const zipData = await storage.readActiveVersion(user, domain);
  if (!zipData) return null;

  const files = await readZip(zipData);

  const candidates = [
    { name: 'favicon.ico', type: 'image/x-icon' },
    { name: 'favicon.png', type: 'image/png' },
    { name: 'favicon.svg', type: 'image/svg+xml' },
  ];

  for (const { name, type } of candidates) {
    const fileData = files[name];
    if (fileData?.length) return { data: fileData, contentType: type };
  }

  return null;
}

export async function getSiteMeta(sessionId: string, domain: string): Promise<Result<{ subdomain?: string } | null>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) {
    return { ok: true, value: null };
  }
  return { ok: true, value: { subdomain: data.subdomain } };
}

export async function getSiteRepos(
  sessionId: string,
  domain: string,
): Promise<Result<{ history: RepoHistoryEntry[] } | null>> {
  const session = await requireSession(sessionId);
  if (!session.ok) return session;
  const user = session.value;
  const data = await sitesDb.readSiteMetadata(user, domain);
  if (!data) return { ok: true, value: null };
  const history = data.repoHistory.map(({ repo, branch, lastUsed }) => ({ repo, branch, lastUsed }));
  return { ok: true, value: { history } };
}
