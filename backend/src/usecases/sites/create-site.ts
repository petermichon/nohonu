import * as fs from 'node:fs/promises';
import * as sitesDb from '../../core/sites/db.ts';
import * as storage from '../../core/sites/storage.ts';
import * as paths from '../../core/sites/paths.ts';
import { db } from '../../db.ts';
import { validateSession } from '../../shared/session-check.ts';
import { SESSION_MAX_AGE_MS } from '../../config.ts';
import {domainDir} from '../../shared/paths.ts';
import type { Result } from '../../shared/errors.ts';


export async function createSite(
  sessionId: string,
  domain: string,
  zipData: Uint8Array,
  subdomain?: string,
): Promise<Result<{ index: number; siteId: string }>> {
  const sessionRecord = await db.session.findUnique({ where: { id: sessionId } });
  const auth = validateSession(sessionRecord, Date.now(), SESSION_MAX_AGE_MS);
  if (!auth.ok) return auth;
  const user = auth.value;

  // Check if domain already exists
  const existingData = await sitesDb.readSiteMetadata(user, domain);
  if (existingData) {
    return { ok: false, code: 'already_exists', message: 'Domain already exists for this user' };
  }

  // Use user-domain as siteId for uniqueness across users
  const siteId = `${user}-${domain}`;

  // Create initial site data
  const data = { ...storage.DEFAULT_DATA };
  data.siteId = siteId;
  data.account = user;
  const index = data.nextIndex;
  data.nextIndex = index + 1;
  data.versions[String(index)] = { source: { type: 'upload' }, createdAt: Date.now() };
  data.currentIndex = index;
  data.lastDeployedAt = Date.now();
  data.subdomain = subdomain || `${user}-${domain}`;
  data.displayName = domain;

  await fs.mkdir(domainDir(user, domain), { recursive: true });
  await fs.mkdir(paths.versionsDir(user, domain), { recursive: true });
  await fs.writeFile(paths.versionPath(user, domain, index), zipData);
  await sitesDb.writeSiteMetadata(user, domain, data);

  return { ok: true, value: { index, siteId } };
}


